import React from 'react'
import { ItemListPage } from '../components/SimpleComponents'

/** Displays the list of available backends */
export const BackendsRoute = props => {

    // Create columns for the table
    const columns = [
        { field: 'name', headerName: 'Name', flex: true },
        { field: 'address', headerName: 'Address', width: 300 },
        { field: 'status', headerName: 'Status', width: 150 }
    ]

    // Map files to rows
    const rows = [
        { id: 0, name: 'TensorFlow.js WASM', address: 'internal://wasm', status: 'Available' },
    ]

    // Render UI
    return <ItemListPage 
        rows={rows}
        columns={columns}
        noItemsTitle="No backends found" 
        noItemsDescription="This should never happen!"
    />

}