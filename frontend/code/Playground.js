import { v4 as uuidv4 } from 'uuid'
import { DatasetFile, Datasets } from './DatasetFile'
import { PlaygroundFile } from './PlaygroundFile'
import { ScriptFile } from './ScriptFile'
import { enqueueSnackbar } from 'notistack'
import { TaskManager } from './TaskManager'

/**
 * Main class for a loaded playground.
 * 
 * @event updated Triggered when data is updated.
 */
export class Playground extends EventTarget {

    /** @type {Playground} Currently opened playground */
    static current = null

    /** @type {FileSystemDirectoryHandle} Playground folder */
    folder = null

    /** Content of the nnplayground.json config file */
    config = null

    /** @type {string} Playground ID */
    get id() {
        return this.config.id
    }

    /** List of all files */
    files = new Files(this)

    /** Returns true if a playground exists in the specified folder */
    static async existsAt(folder) {

        // Check if folder contains a playground
        try {
            await folder.getFileHandle('nnplayground.json')
            return true
        } catch (e) {
            return false
        }

    }

    /** Create a new playground */
    static async create(folder) {

        // Save content
        let file = await folder.getFileHandle('nnplayground.json', { create: true })
        let writer = await file.createWritable()
        await writer.write(JSON.stringify({
            version: 1,
            id: uuidv4()
        }))
        await writer.close()

        // Open playground
        return await Playground.open(folder)

    }

    /** Create a new playground */
    static async open(folder) {

        // Create new playground
        let playground = new Playground()
        playground.folder = folder

        // Load content
        await playground.load()

        // Done
        Playground.current = playground
        return playground

    }

    /** Load playground content */
    async load() {

        // Load content
        let file = await this.folder.getFileHandle('nnplayground.json')
        let content = await file.getFile()
        this.config = JSON.parse(await content.text())

        // Check fields
        if (!this.config.id)
            throw new Error('Invalid playground: Missing ID.')

        // Load modules
        await this.files.refresh()

    }

    /** Get metadata for an item */
    getMetadata(itemID, name) {
        return this.config?.metadata?.[itemID]?.[name]
    }

    /** Set metadata for an item */
    setMetadata(itemID, name, value) {

        // Create or update metadata entry
        this.config.metadata = this.config.metadata || {}
        this.config.metadata[itemID] = this.config.metadata[itemID] || {}
        this.config.metadata[itemID][name] = value

        // Save soon
        this.save()

    }

    /** Save state back to disk */
    async save(immediate) {

        // Debounce
        if (!immediate) {
            if (this.saveTimeout) return
            this.saveTimeout = setTimeout(() => this.save(true), 500)
            return
        } else {
            clearTimeout(this.saveTimeout)
            this.saveTimeout = null
        }

        // Save content
        let file = await this.folder.getFileHandle('nnplayground.json', { create: true })
        let writer = await file.createWritable()
        await writer.write(JSON.stringify(this.config))
        await writer.close()

    }

}

/** Manages all files within the playground */
class Files {

    /** @type {Playground} Reference to the playground */
    playground = null

    /** @type {PlaygroundFile[]} Reference to all dataset files */
    all = []

    /** Mapping of file extensions to file class */
    fileTypes = [
        { ext: '.csv', cls: DatasetFile, folder: 'datasets' },
        { ext: '.js', cls: ScriptFile, folder: 'scripts' },
    ]

    /** File names to exclude from processing */
    exclude = [
        'nnplayground.json',
        '.DS_Store'
    ]

    /** Constructor */
    constructor(playground) {
        this.playground = playground

        // Add listener for page focus and refresh files
        window.addEventListener('focus', () => {
            this.refresh()
        })

    }

    /** Refresh datasets */
    async refresh() {

        // Only allow one at a time
        if (this.refreshing) return
        this.refreshing = true

        // Catch errors
        try {

            // Increase iteration
            this.fileCheckIteration = (this.fileCheckIteration || 0) + 1

            // Check folder recursively
            let didMakeChanges = await this.refreshFolder(this.playground.folder)

            // Remove any files untouched by this iteration
            for (let i = 0 ; i < this.all.length ; i++) {
                let file = this.all[i]
                if (file.fileCheckIteration != this.fileCheckIteration) {
                    this.all.splice(i--, 1)
                    didMakeChanges = true
                }
            }

            // Updated
            if (didMakeChanges)
                this.playground.dispatchEvent(new Event('updated'))

        } catch (e) {

            // Show error
            console.warn('Unable to refresh files:', e)
            enqueueSnackbar('Unable to refresh files: ' + e.message, { variant: 'error' })

        } finally {

            // Done
            this.refreshing = false

        }

    }

    /** @private Refresh files from a specific folder */
    async refreshFolder(folder) {

        // List files
        let didMakeChanges = false
        for await (let file of folder.values()) {

            // Check if it's excluded
            if (this.exclude.includes(file.name))
                continue

            // If it's a folder, go inside
            if (file.kind == 'directory') {
                if (await this.refreshFolder(file)) didMakeChanges = true
                continue
            }
            
            // Get file details
            let relativePathComponents = await this.playground.folder.resolve(file)
            let relativePath = relativePathComponents.join('/')

            // Check if exists already
            let existingFile = this.all.find(f => f.relativePath == relativePath)
            if (!existingFile) {

                // Create it ... get class type
                let fileTypeInfo = this.fileTypes.find(e => file.name.toLowerCase().endsWith(e.ext))
                let FileClass = fileTypeInfo?.cls || PlaygroundFile

                // Create and add it
                existingFile = new FileClass()
                existingFile.playground = this.playground
                existingFile.path = relativePath
                existingFile.fileSnapshot = await file.getFile()
                existingFile.handle = file
                this.all.push(existingFile)
                didMakeChanges = true

            }

            // Update iteration counter
            existingFile.fileCheckIteration = this.fileCheckIteration

            // Process it if necessary
            await existingFile._process()

        }

        // Done
        return didMakeChanges

    }

    /** Add files to the dataset storage */
    async store(files) {

        // Create task
        await TaskManager.shared.build().name(`Importing files`).action(async task => {

            // Calculate total size
            let totalSize = files.reduce((a, b) => a + (b.size || 1), 0)

            // Go through each file
            for (let i = 0 ; i < files.length ; i++) {

                // Show task status
                let file = files[i]
                task.setStatus(`File ${i + 1} of ${files.length}`)
                task.setProgress(i / files.length)

                // Get file info
                let fileTypeInfo = this.fileTypes.find(e => file.name.toLowerCase().endsWith(e.ext))
                if (!fileTypeInfo)
                    throw new Error(`Unsupported file type: ${file.name}`)

                // Create file
                let fsFolder = await this.playground.folder.getDirectoryHandle(fileTypeInfo.folder, { create: true })
                let fsFile = await fsFolder.getFileHandle(file.name, { create: true })

                // Write file
                let writable = await fsFile.createWritable()
                await writable.write(file)
                await writable.close()
            
                // Get file details
                let relativePathComponents = await this.playground.folder.resolve(fsFile)
                let relativePath = relativePathComponents.join('/')

                // Create and add it
                let FileClass = fileTypeInfo.cls || PlaygroundFile
                let playgroundFile = new FileClass()
                playgroundFile.playground = this.playground
                playgroundFile.path = relativePath
                playgroundFile.fileSnapshot = await fsFile.getFile()
                playgroundFile.handle = fsFile
                this.all.push(playgroundFile)

                // Start processing it
                await playgroundFile._process()

            }

            // Notify changed
            this.playground.dispatchEvent(new Event('updated'))

        }).schedule()

    }

    /** Delete the files at the specified paths */
    async delete(paths) {

        // Create task
        await TaskManager.shared.build().name(`Deleting files`).action(async task => {

            // Go through each path
            for (let i = 0 ; i < paths.length ; i++) {

                // Update status
                let path = paths[i]
                task.setStatus(`File ${i + 1} of ${paths.length}`)
                task.setProgress(i / paths.length)

                // Find file
                let fileIdx = this.all.findIndex(f => f.path == path)
                if (fileIdx == -1) throw new Error("File not found: " + path)
                let file = this.all[fileIdx]

                // Get path components
                let relativePathComponents = await this.playground.folder.resolve(file.handle)
                if (!relativePathComponents || relativePathComponents.length == 0)
                    throw new Error("File is not part of the playground folder.")
                    
                // Get folder handle for the folder containing the file
                let folder = this.playground.folder
                for (let i = 0 ; i < relativePathComponents.length - 1 ; i++)
                    folder = await folder.getDirectoryHandle(relativePathComponents[i])

                // Delete file
                await folder.removeEntry(relativePathComponents[relativePathComponents.length - 1])

                // Remove from list
                this.all.splice(fileIdx, 1)

            }

            // Notify changed
            this.playground.dispatchEvent(new Event('updated'))

        }).schedule()

    }

}