import React, { useState } from 'react'
import { ItemListPage } from '../components/SimpleComponents'
import { useSearchParams } from 'react-router-dom'
import { Alert } from '@mui/material'

/** Maximum file size to process */
const MaxFileSize = 1024*64

/** Displays the contents of a CSV */
export const ViewCsvRoute = props => {

    // State
    let [ searchParams, setSearchParams ] = useSearchParams()
    let [ error, setError ] = useState(null)
    let [ isFullFile, setIsFullFile ] = useState(true)
    let [ columns, setColumns ] = useState([])
    let [ rows, setRows ] = useState([])

    // Check if file exists
    let path = searchParams.get('path')
    let file = Playground.current.files.all.find(f => f.path == path)

    // Function to fetch the file content
    const fetchFileContent = async () => {

        // Catch errors
        try {

            // Check file size
            let fileRef = await file.handle.getFile()
            setIsFullFile(fileRef.size <= MaxFileSize)

            // Get CSV content
            let csv = await file.readCSV(true, MaxFileSize)

            // Remove last entry if the file was truncated
            if (!isFullFile)
                csv.pop()

            // Go through columns
            let columns = []
            for (let columnName of Object.keys(csv[0])) {

                // Create column info
                columns.push({
                    field: columnName,
                    headerName: columnName,
                    width: 300,
                })

            }

            // Add IDs to each row entry
            for (let i = 0; i < csv.length; i++) {
                csv[i].id = i
            }

            // Finished processing
            setError(null)
            setColumns(columns)
            setRows(csv)
            console.log('columns', columns)
            console.log('rows', rows)

        } catch (err) {

            // Set error
            setError(err)

        }

    }

    // Get text content when the file entry is updated (and on first mount)
    React.useEffect(() => {
        fetchFileContent()
        return () => null
    }, [ file ])

    // Fetch text content again when the window becomes focused
    React.useEffect(() => {
        window.addEventListener('focus', fetchFileContent)
        return () => window.removeEventListener('focus', fetchFileContent)
    }, [])

    // Render UI
    return <>

        {/* Truncation warning */}
        { isFullFile ? null : <Alert severity="info" style={{ margin: '10px 10px 0px 10px', border: '1px solid #DDD', borderRadius: 4 }}>This file is large and has been truncated to 64KB while viewing.</Alert> }

        {/* Error notice */}
        { error ? <Alert severity="warning" style={{ margin: '10px 10px 0px 10px', border: '1px solid #DDD', borderRadius: 4 }}>Error: {error.message}</Alert> : null }
    
        {/* Content */}
        <div style={{ position: 'relative', flex: '1 1 1px' }}>
            <ItemListPage
                rows={rows}
                columns={columns}
                noItemsTitle="No data" 
                noItemsDescription="This CSV file has no data."
            />
        </div>

    </>

}