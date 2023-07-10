import * as csvSync from 'csv/dist/esm/sync'
import { PlaygroundFile } from "./PlaygroundFile"

/**
 * Represents a single dataset file.
 */
export class DatasetFile extends PlaygroundFile {

    /** File type description */
    static type = 'Dataset'

    /** Get column names in this file */
    get columnNames() {
        return this.getMetadata('columns') || []
    }

    /** Process the file if needed */
    async process() {

        // Get the first 10KB of the file
        let csv = await this.readCSV(false, 1024*10)
        let columnNames = csv[0]

        // Save it
        this.setMetadata('columns', columnNames)
        this.setMetadata('lastModifiedProcessedDate', this.lastModified)

        // Emit update
        this.playground.dispatchEvent(new Event('updated'))

    }

    /** 
     * Parse file as CSV data
     * 
     * @param {boolean} columns Whether to parse the first row as column names. If true, returns an array of objects. If false, returns an array of arrays.
     * @param {number} sizeLimit Maximum file size to read
     * @param {number} fromLine Line to start reading from, starting from 1. If 0, starts from the user-set starting value.
     * @returns {Promise<Array>} Array of objects or arrays
     */
    async readCSV(columns = true, sizeLimit = 16000, fromLine = 0) {

        // Get the first 16KB of the file
        let file = await this.handle.getFile()
        let text = await file.slice(0, sizeLimit).text()

        // Check starting line
        if (fromLine <= 0) {
            fromLine = this.getMetadata('startingLine') || 1

        // Parse CSV
        return csvSync.parse(text, { columns, relax_column_count: true, from_line: fromLine })

    }

}