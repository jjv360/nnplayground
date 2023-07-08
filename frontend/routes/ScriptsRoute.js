import React from 'react'
import { Playground } from '../code/Playground'
import { ItemListPage } from '../components/SimpleComponents'
import { ScriptFile } from '../code/ScriptFile'
import Swal from 'sweetalert2'
import { formatSize } from '../utilities/formatters'
import { usePlaygroundFiles } from '../components/hooks'
import { useNavigate } from 'react-router-dom'

/** Displays the list of available scripts */
export const ScriptsRoute = props => {

    // Get files
    let files = usePlaygroundFiles(f => f instanceof ScriptFile)

    // Get navigate
    let navigate = useNavigate()
    
    // Create columns for the table
    const columns = [
        { field: 'name', headerName: 'Name', flex: true, editable: false, valueFormatter: params => params.value.replace(/\.js$/i, '') },
        { field: 'size', headerName: 'Size', width: 150, type: 'number', valueFormatter: params => formatSize(params.value) },
        { field: 'lastModified', headerName: 'Last Modified', width: 200, type: 'dateTime' },
    ]

    // Map files to rows
    const rows = files.map(file => ({
        id: file.path,
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified)
    }))

    // Called when the user presses the "Create script" button
    const createScript = async () => {

        // Ask user for the name of the new script
        let result = await Swal.fire({
            icon: 'question',
            title: 'Create script',
            input: 'text',
            inputLabel: 'Enter a name for the new script',
            inputPlaceholder: '',
            showCancelButton: true,
            inputValidator: value => {
                if (!value) return 'You must enter a name for the new script'
                if (Playground.current.files.all.some(f => f.name.toLowerCase() == value.toLowerCase())) return 'A script with that name already exists'
            }
        })

        // If the user cancelled, stop
        if (result.isDismissed)
            return

        // Ensure it ends with .js
        let filename = result.value
        if (!filename.toLowerCase().endsWith('.js'))
            filename += '.js'

        // Create the new script
        let scriptCode = `
/**
 * My custom script.
 */

console.log('My script started!')
        `.trim()

        // Write to file
        let file = new File([scriptCode], filename, { type: 'text/javascript' })
        Playground.current.files.store([file])

    }

    // Render UI
    return <ItemListPage 
        rows={rows}
        columns={columns}
        noItemsTitle="No scripts found" 
        noItemsDescription="Scripts allow you to perform actions via code."
        onCreate={createScript}
        onDelete={paths => Playground.current.files.delete(paths)}
        onDoubleClick={itm => navigate(`/script/edit?path=${encodeURIComponent(itm.id)}`)}
    />

}