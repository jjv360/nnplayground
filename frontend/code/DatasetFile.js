import { toast } from "react-toastify"
import { Tasks } from "./Tasks"
import * as csvSync from 'csv/dist/esm/sync'
import { PlaygroundFile } from "./PlaygroundFile"

/**
 * Represents a single dataset file.
 */
export class DatasetFile extends PlaygroundFile {

    /** File type description */
    static type = 'Dataset'

    /** Process the file if needed */
    async process() {

        // Get the first 10KB of the file
        let file = await this.handle.getFile()
        let text = await file.slice(0, 10000).text()
        let columnNames = csvSync.parse(text, { columns: false, relax_column_count: true, from_line: 1 })[0]

        // Save it
        this.setMetadata('columns', columnNames)
        this.setMetadata('lastModifiedProcessedDate', this.lastModified)

        // Emit update
        this.playground.dispatchEvent(new Event('updated'))

    }

}