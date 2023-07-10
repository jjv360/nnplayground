import React, { useEffect, useState } from 'react'
import { ItemListPage } from '../components/SimpleComponents'
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import Swal from 'sweetalert2'
import { Playground } from '../code/Playground'
import { DatasetFile } from '../code/DatasetFile'
import { v4 as uuidv4 } from 'uuid'
import { usePlaygroundUpdates } from '../components/hooks'
import { TaskManager } from '../code/TaskManager'

/** Displays assigned columns */
export const ColumnsRoute = props => {

    // State
    let [ editDialogOpen, setEditDialogOpen ] = useState(false)
    let [ editingColumn, setEditingColumn ] = useState(null)

    // Watch for playground updates
    usePlaygroundUpdates()

    // Map files to rows
    const rows = Playground.current.columns.getAll()

    // Create columns for the table
    const columns = [
        { field: 'name', headerName: 'Column Name', flex: true },
        { field: 'type', headerName: 'Type', width: 150, valueFormatter: params => {
            if (params.value == 'timestamp') return 'Timestamp'
            if (params.value == 'boolean') return 'Boolean'
            if (params.value == 'label') return 'Label'
            if (params.value == 'number') return 'Number'
            if (params.value == 'timeseries-identifier') return 'Timeseries ID'
        } },
        { field: 'source', headerName: 'Source', width: 300, valueFormatter: params => {
            if (params.value == 'column') return `Column (${rows.find(r => r.id == params.id)?.columnName || '?'})`
            if (params.value == 'filename') return 'Filename'
            if (params.value == 'custom') return 'Custom code'
        } },
    ]

    // Called on "autocreate" button click
    const onAutocreate = async () => {

        // Go through all existing columns
        let existingColumns = Playground.current.columns.getAll()
        let newColumns = []
        for (let datasetFile of Playground.current.files.all.filter(f => f instanceof DatasetFile)) {
            for (let columnName of datasetFile.columnNames) {

                // If this column already exists, skip it
                if (existingColumns.some(c => c.columnName == columnName)) continue
                if (newColumns.some(r => r == columnName)) continue

                // Add this column
                newColumns.push(columnName)

            }
        }

        // Check if no columns to add
        if (newColumns.length == 0)
            return Swal.fire({ title: 'No columns to add', icon: 'info', text: 'All fields from your data files have already been created.' })

        // Confirm with user
        let result = await Swal.fire({
            icon: 'question',
            title: 'Autocreate columns',
            html: `This will create ${newColumns.length} new columns. Are you sure you want to continue?`,
            showCancelButton: true,
            confirmButtonText: 'Create',
            cancelButtonText: 'Cancel'
        })

        // If the user cancelled, stop
        if (result.isDismissed)
            return

        // Add all columns in a new task
        TaskManager.shared.build().name('Generating columns').action(async task => {
            for (let i = 0 ; i < newColumns.length ; i++) {
                let newColumn = newColumns[i]
                await task.setStatus(newColumn)
                await task.setProgress(i / newColumns.length)
                await Playground.current.columns.putAutodetect(newColumn)
            }
        }).schedule()

    }

    // Render UI
    return <>
    
        {/* Column list */}
        <ItemListPage 
            rows={rows}
            columns={columns}
            noItemsTitle="No columns found" 
            noItemsDescription="Assign usable columns from your datasets."
            onCreate={() => {
                setEditingColumn(null)
                setEditDialogOpen(true)
            }}
            onDelete={ids => Playground.current.columns.remove(ids)}
            onDoubleClick={itm => {
                setEditingColumn(itm.row)
                setEditDialogOpen(true)
            }}
            extraActions={<>
                <Button variant="outlined" onClick={onAutocreate}>Autocreate</Button>
            </>}
        />

        {/* Column editor dialog */}
        <ColumnEditDialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} column={editingColumn} />

    </>

}

/** Column editing dialog */
const ColumnEditDialog = props => {

    // State
    let [ name, setName ] = useState('')
    let [ type, setType ] = useState('')
    let [ source, setSource ] = useState('')
    let [ columnName, setColumnName ] = useState('')
    let [ customCode, setCustomCode ] = useState('')
    let [ allColumns, setAllColumns ] = useState([])
    let [ minValue, setMinValue ] = useState(0)
    let [ maxValue, setMaxValue ] = useState(1)

    // Fetch list of all columns in the file data
    useEffect(() => {

        // Get all columns
        let allColumns = []
        for (let datasetFile of Playground.current.files.all.filter(f => f instanceof DatasetFile)) {
            for (let columnName of datasetFile.columnNames) {
                if (allColumns.includes(columnName)) continue
                allColumns.push(columnName)
            }
        }

        // Set state
        setAllColumns(allColumns)

    }, [])

    // Set initial state when changing the editing column
    useEffect(() => {
        console.log(props.column)
        setName(props.column?.name || '')
        setType(props.column?.type || '')
        setSource(props.column?.source || '')
        setColumnName(props.column?.columnName || '')
        setCustomCode(props.column?.customCode || '')
        setMinValue(props.column?.minValue || '')
        setMaxValue(props.column?.maxValue || '')
    }, [ props.column ])

    // Called on create/save
    const onSave = () => {

        // Update it
        Playground.current.columns.put({
            id: props.column?.id || uuidv4(),
            name,
            type,
            source,
            columnName,
            customCode,
            minValue,
            maxValue,
        })

        // Close dialog
        props.onClose()

    }

    // Render UI
    return <Dialog open={props.open} onClose={props.onClose} scroll="paper" fullWidth maxWidth="sm">
        <DialogTitle id="scroll-dialog-title">{props.column ? "Edit Column" : "Create Column"}</DialogTitle>
        <DialogContent dividers>
                
            {/* Column name */}
            <FormControl fullWidth sx={{ margin: '10px 0px' }}>
                <TextField label="Name" autoFocus fullWidth value={name} onChange={e => setName(e.target.value)} />
                <FormHelperText>The name of this column.</FormHelperText>
            </FormControl>

            {/* Column type */}
            <FormControl fullWidth sx={{ margin: '10px 0px' }}>
                <InputLabel id="column-edit-label-type">Type</InputLabel>
                <Select label="Type" labelId="column-edit-label-type" value={type} onChange={e => setType(e.target.value)} fullWidth>
                    <MenuItem value="timestamp">Timestamp</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                    <MenuItem value="label">Label</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="timeseries-identifier">Timeseries Identifier</MenuItem>
                </Select>
                <FormHelperText>{(() => {
                    if (type == 'timestamp') return <>Timestamp fields contain a date or unix timestamp. Anything that can be parsed with <b><code>new Date()</code></b>.</>
                    if (type == 'boolean') return <>Boolean fields contain a true or false value. Examples: 0, 1, true, false, yes, no.</>
                    if (type == 'label') return <>Label fields contain a string which identifies the data type of the row, such as "cat", "dog", etc.</>
                    if (type == 'number') return <>Number fields contain a number that can be normalized between 0 and 1. Examples: 23, 576.3, 2930.</>
                    if (type == 'timeseries-identifier') return <>This column will be used to identify different timeseries. For example, if you have a dataset with multiple timeseries, you can use this column to identify which timeseries each row belongs to.</>
                })()}</FormHelperText>
            </FormControl>

            {/* Set the min and max values */}
            {type == 'number' && <Grid container spacing={2}>
                <Grid item xs={6}>
                    <FormControl fullWidth sx={{ margin: '10px 0px' }}>
                        <TextField label="Minimum value" fullWidth value={minValue} onChange={e => setMinValue(e.target.value)} />
                        <FormHelperText>Leave blank to autodetect.</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth sx={{ margin: '10px 0px' }}>
                        <TextField label="Max value" fullWidth value={maxValue} onChange={e => setMaxValue(e.target.value)} />
                        <FormHelperText>Leave blank to autodetect.</FormHelperText>
                    </FormControl>
                </Grid>
            </Grid>}

            {/* Column source */}
            <FormControl fullWidth sx={{ margin: '10px 0px' }}>
                <InputLabel id="column-edit-label-source">Source</InputLabel>
                <Select label="Source" labelId="column-edit-label-source" value={source} onChange={e => setSource(e.target.value)} fullWidth>
                    <MenuItem value="column">Column</MenuItem>
                    <MenuItem value="filename">File name</MenuItem>
                    <MenuItem value="custom">Custom code</MenuItem>
                </Select>
                <FormHelperText>{(() => {
                    if (source == 'column') return <>The column value comes directly from the specified column in your source data.</>
                    if (source == 'filename') return <>The column value is the file name of the file it comes from, minus the extension.</>
                    if (source == 'custom') return <>You can specify custom code below to retrieve the value for each row in this column.</>
                })()}</FormHelperText>
            </FormControl>

            {/* Original column name, if the source type is "column" */}
            { source == 'column' ?
                <FormControl fullWidth sx={{ margin: '10px 0px' }}>
                    <InputLabel id="column-edit-label-columnName">Original column name</InputLabel>
                    <Select label="Original column name" labelId="column-edit-label-columnName" value={columnName} onChange={e => setColumnName(e.target.value)} fullWidth>
                        { allColumns.map(columnName => <MenuItem key={columnName} value={columnName}>{columnName}</MenuItem>) }
                    </Select>
                    <FormHelperText>The column in the source data to use.</FormHelperText>
                </FormControl>
            : null }
                
            {/* Custom code field, if the source type is "custom" */}
            { source == 'custom' ?
                <FormControl fullWidth sx={{ margin: '10px 0px' }}>
                    <TextField label="Custom code" autoFocus fullWidth multiline value={customCode} onChange={e => setCustomCode(e.target.value)} style={{ fontFamily: 'monospace' }} />
                    <FormHelperText>
                        If specified, this code can be used to return a custom value for each row in this column. 
                        <ul style={{ margin: '4px 12px', padding: 0 }}>
                            <li><b><code>row</code></b> contains the data for the row in the original file</li>
                            <li><b><code>file.name</code></b> contains the original file's name</li>
                        </ul>
                    </FormHelperText>
                </FormControl>
            : null }

        </DialogContent>
        <DialogActions>
            <Button onClick={props.onClose}>Cancel</Button>
            <Button onClick={onSave}>{props.column ? 'Save' : 'Create'}</Button>
        </DialogActions>
    </Dialog>

}