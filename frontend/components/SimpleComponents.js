import { Button } from '@mui/material'
import { DataGrid, GridFooter, GridFooterContainer } from '@mui/x-data-grid'
import React from 'react'
import Swal from 'sweetalert2'

/** Displays a fullscreen notice */
export const FullscreenNotice = props => <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        
    {/* Logo */}
    <img src={props.icon} style={{ width: 128, height: 128, marginBottom: 40 }} draggable="false" />
    <div style={{ textAlign: 'center', fontSize: 20, fontWeight: '500', color: '#333', maxWidth: 400, marginBottom: 10 }}>{props.title}</div>
    <div style={{ textAlign: 'center', fontSize: 14, color: '#888', maxWidth: 400, lineHeight: 1.5, marginBottom: 30 }}>{props.description}</div>

    {/* Extras */}
    {props.children}

</div>

/** Page that lists items */
export const ItemListPage = props => {

    // State
    let [ selectedIDs, setSelectedIDs ] = React.useState([])

    // Called when the user presses Delete
    const onDelete = async () => {

        // Ask user for confirmation
        let value = await Swal.fire({
            icon: 'question',
            title: 'Delete ' + (selectedIDs.length == 1 ? 'this item' : selectedIDs.length + ' items') + '?',
            html: `Are you sure you want to delete the selected items?`,
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Cancel',
            focusCancel: true
        })

        // Check result
        if (!value.isConfirmed)
            return

        // Pass on
        props.onDelete(selectedIDs)

    }

    // // Called when the user edits a cell
    // const processRowUpdate = (newRow, oldRow) => {

    //     // Stop if name hasn't changed (or if no rename prop exists)
    //     if (newRow.name == oldRow.name || !props.onRename)
    //         return newRow

    //     // Pass on
    //     props.onRename(oldRow.id, newRow.name)
    //     return newRow

    // }

    // // If rename prop exists, allow the 'name' field to be edited
    // if (props.onRename) {
    //     let nameColumn = props.columns.find(c => c.field == 'name')
    //     if (nameColumn) nameColumn.editable = true
    // }

    // If no datasets are available, show message
    if (props.rows.length == 0) return <FullscreenNotice icon={require('../resources/icon-folder.svg')} title={props.noItemsTitle || "No items"} description={props.noItemsDescription || "No items found in this folder."}>
        <div style={{ display: 'flex', gap: 10 }}>
            { props.onCreate ? <Button variant="outlined" onClick={props.onCreate}>Create new</Button> : null }
            { props.extraActions }
        </div>
    </FullscreenNotice>

    // Render UI
    return <>

        {/* Content */}
        <div style={{ position: 'absolute', top: 10, left: 10, width: 'calc(100% - 20px)', height: 'calc(100% - 20px)' }}>
            <DataGrid 
                rows={props.rows} 
                columns={props.columns} 
                checkboxSelection 
                columnHeaderHeight={50} 
                density="standard" 
                disableColumnFilter 
                disableColumnMenu 
                disableColumnSelector
                disableRowSelectionOnClick
                // processRowUpdate={processRowUpdate}
                onRowSelectionModelChange={ids => setSelectedIDs(ids)}
                onProcessRowUpdateError={err => {
                    console.warn('Unable to update row', err)
                    Swal.fire({ icon: 'error', title: 'Unable to update', text: err.message })
                }}
                onRowDoubleClick={props.onDoubleClick}
                slots={{
                    footer: () => <GridFooterContainer>
                        <div style={{ margin: '0px 10px', display: 'flex', gap: 10 }}>
                            { selectedIDs.length == 0 && props.onCreate ? <Button variant="contained" onClick={props.onCreate}>Create new</Button> : null }
                            { selectedIDs.length > 0 && props.onDelete ? <Button variant="outlined" onClick={onDelete}>Delete selected</Button> : null }
                            {/* <Button variant="outlined">Remove</Button> */}
                            { props.extraActions }
                        </div>
                        <GridFooter sx={{
                            border: 'none', // To delete double border.
                        }} />
                    </GridFooterContainer>
                }}
                {...props.gridProps}
            />
        </div>

    </>

}