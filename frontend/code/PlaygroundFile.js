import { enqueueSnackbar } from "notistack"

/**
 * Generic class representing a file in the playground.
 */
export class PlaygroundFile {

    /** File type description */
    static type = 'Unknown'

    /** Processing version ... if this is changed, all files of this type will be reprocessed. */
    static processingVersion = 1

    /** @type {Playground} Reference to the playground */
    playground = null

    /** @type {File} A snapshot of the file stats the last time it was checked */
    fileSnapshot = null

    /** @type {FileSystemFileHandle} Reference to the file system handle */
    handle = null

    /** Path to the file relative to the playground folder */
    path = ''

    /** Get name */
    get name() {
        return this.fileSnapshot.name
    }

    /** Get size */
    get size() {
        return this.fileSnapshot.size
    }

    /** Get last modified date */
    get lastModified() {
        return this.fileSnapshot.lastModified
    }

    /** Processed state of this file */
    get isProcessed() {
        let processHash = this.lastModified + ':' + this.__proto__.processingVersion
        return this.getMetadata('processHash') == processHash
    }

    /** File type description */
    get type() {
        return this.prototype.type
    }

    /** Get metadata for this file */
    getMetadata(field) {
        return this.playground.getMetadata('file:' + this.name, field)
    }

    /** After making changes to the metadat, this saves it back to disk */
    setMetadata(name, value) {
        this.playground.setMetadata('file:' + this.name, name, value)
    }

    /** @private Called by Playground to process the file. */
    async _process() {

        // Check if already processed
        if (this.isProcessed) 
            return

        // Catch errors
        try {

            // Process
            await this.process()

            // Update metadata
            let processHash = this.lastModified + ':' + this.__proto__.processingVersion
            this.setMetadata('processHash', processHash)

            // Notify updated
            this.playground.dispatchEvent(new Event('updated'))

        } catch (err) {

            // Failed to process file
            console.warn('Failed to process ' + this.path, err)
            enqueueSnackbar('Failed to process ' + this.path + ': ' + err.message, { variant: 'error' })

        }

    }

    /** Process the file. This should be overridden by subclasses to perform processing on this file. */
    async process() {
        return
    }

    /** 
     * Replace the contents of the file with the associated string 
     * 
     * @param {string} text The new text content
     * @param {number} debounceMs The debounce time in milliseconds. If 0 or not set, will write immediately.
     */
    async setContent(text, debounceMs) {

        // Debounce
        if (debounceMs) {
            if (this._updateTimeout) clearTimeout(this._updateTimeout)
            await new Promise(resolve => this._updateTimeout = setTimeout(resolve, debounceMs))
        }

        // Update file
        let writable = await this.handle.createWritable()
        await writable.write(text)
        await writable.close()

        // Get new file reference
        this.fileSnapshot = await this.handle.getFile()

        // Notify updated
        this.playground.dispatchEvent(new Event('updated'))

    }

}