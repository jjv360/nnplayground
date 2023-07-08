import { toast } from "react-toastify"

/**
 * Task manager
 */
export class Tasks {

    /** Singleton */
    static shared = new Tasks()

    /** Run a task */
    async run(name, code) {

        // Create toast
        console.debug(`[Tasks] Running task: ${name}`)
        let toastId = toast.loading(name, { type: 'info' })

        // Create task
        let task = {
            name,
            toastId,
        }

        // Check for errors
        try {

            // Run it
            let result = await code(task)
            console.debug(`[Tasks] Completed task: ${name}`)
            return result

        } catch (err) {

            // Ignore abort errors
            if (err.name === 'AbortError') 
                return

            // Log error
            console.error(`[Tasks] Error in task: ${name}`, err)

        } finally {

            // Complete the toast
            toast.done(toastId)

            // Remove toast after a bit
            // setTimeout(e => toast.dismiss(toastId), 2000)

        }

    }

}