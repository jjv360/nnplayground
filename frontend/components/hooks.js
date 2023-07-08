import React from "react"
import { Playground } from "../code/Playground"

/**
 * Fetch list of files from the current playground.
 */
export const usePlaygroundFiles = (filter) => {

    // State
    let [ filesLastChanged, setFilesLastChanged ] = React.useState(Date.now())

    // Listen for changes to files
    React.useEffect(() => {

        // Callback
        const callback = () => setFilesLastChanged(Date.now())

        // Listen for changes
        Playground.current.addEventListener('updated', callback)

        // Remover
        return () => Playground.current.removeEventListener('updated', callback)

    }, [])

    // Apply filter if needed
    let files = Playground.current.files.all
    if (filter)
        files = files.filter(filter)

    // Return files
    return files

}