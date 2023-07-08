import { enqueueSnackbar } from "notistack"
import { PlaygroundFile } from "./PlaygroundFile"
import { TaskManager } from "./TaskManager"

/**
 * Represents a script file.
 */
export class ScriptFile extends PlaygroundFile {

    /** File type description */
    static type = 'Script'

    /** Process the file if needed */
    async process() { }

    /** Execute this script */
    execute() {

        // Get name without the JS extension
        let name = this.name.replace(/\.js$/, '')

        // Show status
        enqueueSnackbar('Starting: ' + name, { autoHideDuration: 2000 })

        // Run task
        TaskManager.shared.build().name(name).action(async task => {

            // Load script code
            let code = await this.handle.getFile().then(file => file.text())

            // Evaluate the script code
            let func = eval('(async (TaskManager, Playground, task, enqueueSnackbar) => {' + code + '})')

            // Run it and pass in some useful classes
            await func(
                TaskManager, 
                Playground, 
                task, 
                enqueueSnackbar
            )

        }).schedule()

    }

}