import { v4 as uuidv4 } from 'uuid'

/**
 * Manages columns in the playground.
 */
export class Columns {

    /** @type {Playground} Reference to the playground */
    playground = null

    /** Constructor */
    constructor(playground) {
        this.playground = playground
    }

    /** Get all columns */
    getAll() {
        if (!this.playground.config.columns) this.playground.config.columns = []
        return this.playground.config.columns
    }

    /** Add new column */
    put(column) {

        // Add ID if none exists
        if (!column.id) column.id = uuidv4()

        // Find existing column index
        let index = this.getAll().findIndex(c => c.id == column.id)
        if (index == -1) {

            // Add new column
            this.playground.config.columns = this.playground.config.columns.concat([column])

        } else {

            // Update existing column
            let existingColumn = this.playground.config.columns[index]
            Object.assign(existingColumn, column)

        }

        // Send updated event
        this.playground.dispatchEvent(new Event('updated'))

        // Save
        this.playground.save()

    }

    /** Remove column */
    remove(columnIDs) {

        // Remove columns
        this.playground.config.columns = this.playground.config.columns.filter(c => !columnIDs.includes(c.id))

        // Send updated event
        this.playground.dispatchEvent(new Event('updated'))

        // Save
        this.playground.save()

    }

    /** Add an autodetected column, based on the actual data for the specified field */
    async putAutodetect(name) {

        // Generate column info
        let column = {
            name,
            type: 'label',
            source: 'column',
            columnName: name,
        }

        // Find a file with this column
        let file = this.playground.files.all.find(f => f.columnNames?.includes(name))
        if (!file) {

            // This shouldn't happen
            console.warn(`Could not find a file with column '${name}' for autodetecting`)
            this.put(column)
            return

        }

        // Get only the entries we want to check
        let rows = await file.readCSV(true, 4000)
        let entries = rows.map(r => r[name]).filter(r => r !== undefined && r !== null)

        // Check if field is a timestamp
        let lowercaseFieldName = name.toLowerCase()
        let allValuesAreValidDates = entries.every(e => !isNaN(e) || !isNaN(Date.parse(e)))
        if (allValuesAreValidDates && ['timestamp', 'time', 'date', 'unix'].find(n => lowercaseFieldName.includes(n))) {

            // Probably a date field
            column.type = 'timestamp'
            this.put(column)
            return

        }

        // Check if field is a number
        let allValuesAreNumbers = entries.every(e => !isNaN(e))
        if (allValuesAreNumbers) {

            // Probably a number field
            column.type = 'number'
            this.put(column)
            return

        }

        // Check if field is a boolean
        const booleanValues = ['true', 'false', 'yes', 'no', 'y', 'n', '1', '0', '']
        let allValuesAreBooleans = entries.every(e => booleanValues.includes(e.toLowerCase()))
        if (allValuesAreBooleans) {

            // Probably a boolean field
            column.type = 'boolean'
            this.put(column)
            return

        }

        // Add generic field
        this.put(column)

    }

}