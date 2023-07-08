import React from 'react'
import { ItemListPage } from '../components/SimpleComponents'
import { DatasetFile } from '../code/DatasetFile'
import { formatSize } from '../utilities/formatters'
import { usePlaygroundFiles } from '../components/hooks'

/** Displays the list of dataset files in this playground */
export const DatasetsRoute = props => {

    // Get files
    let files = usePlaygroundFiles(f => f instanceof DatasetFile)
    
    // Create columns for the table
    const columns = [
        { field: 'name', headerName: 'Filename', flex: true, editable: false },
        { field: 'size', headerName: 'Size', width: 150, type: 'number', valueFormatter: params => formatSize(params.value) },
        { field: 'lastModified', headerName: 'Last Modified', width: 200, type: 'dateTime' },
        { field: 'status', headerName: 'Status', width: 150 }
    ]

    // Map files to rows
    const rows = files.map((file, idx) => ({
        id: idx,
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
    />

}