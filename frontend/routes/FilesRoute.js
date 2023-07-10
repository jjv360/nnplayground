import React from 'react'
import { ItemListPage } from '../components/SimpleComponents'
import { DatasetFile } from '../code/DatasetFile'
import { formatSize } from '../utilities/formatters'
import { usePlaygroundFiles } from '../components/hooks'
import { Playground } from '../code/Playground'
import { useNavigate } from 'react-router-dom'

/** Displays the list of input files in this playground */
export const FilesRoute = props => {

    // Get files
    let files = usePlaygroundFiles(f => f instanceof DatasetFile)

    // Get navigator
    let navigate = useNavigate()
    
    // Create columns for the table
    const columns = [
        { field: 'name', headerName: 'Filename', flex: true, editable: false },
        { field: 'size', headerName: 'Size', width: 150, type: 'number', valueFormatter: params => formatSize(params.value) },
        { field: 'lastModified', headerName: 'Last Modified', width: 200, type: 'dateTime' },
        { field: 'status', headerName: 'Status', width: 150 }
    ]

    // Map files to rows
    const rows = files.map(file => ({
        id: file.path,
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        status: file.isProcessed ? 'Processed' : 'Unprocessed'
    }))

    // Render UI
    return <ItemListPage 
        rows={rows}
        columns={columns}
        noItemsTitle="No datasets found" 
        noItemsDescription="Drag a CSV file in here."
        onDelete={paths => Playground.current.files.delete(paths)}
        onDoubleClick={itm => navigate(`/file/csv?path=${encodeURIComponent(itm.id)}`)}
    />

}