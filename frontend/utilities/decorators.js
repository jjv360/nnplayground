import Swal from "sweetalert2"

/**
 * Decorator which shows errors to the user.
 */
export function showErrors(originalFunction) {

    // Wrap function
    return async function() {

        // Try to run function
        try {

            // Run function
            return await originalFunction.apply(this, arguments)

        } catch (e) {

            // Ignore abort errors
            if (e.name === 'AbortError') 
                return

            // Show error
            console.warn(e.message)
            Swal.fire({ icon: 'error', title: 'Error', text: e.message })

        }

    }

}