import React, { useEffect, useState } from 'react'
import { ItemListPage } from '../components/SimpleComponents'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { Playground } from '../code/Playground'
import { usePlaygroundUpdates } from '../components/hooks'
import { useNavigate } from 'react-router-dom'

/** Displays models */
export const ModelsRoute = props => {

    // State
    let [ createDialogOpen, setCreateDialogOpen ] = useState(false)

    // Use navigation
    const navigate = useNavigate()

    // Watch for playground updates
    usePlaygroundUpdates()

    // Map files to rows
    const rows = []

    // Create columns for the table
    const columns = [
        { field: 'name', headerName: 'Column Name', flex: true },
    ]

    // Render UI
    return <>
    
        {/* Column list */}
        <ItemListPage 
            rows={rows}
            columns={columns}
            noItemsTitle="No models found" 
            noItemsDescription="Create a model to get started"
            onCreate={() => navigate('/models/new')}
        />

    </>

}