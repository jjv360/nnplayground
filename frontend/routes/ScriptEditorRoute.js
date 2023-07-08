import { useLocation, useParams, useSearchParams } from "react-router-dom"
import { Playground } from "../code/Playground"
import React from "react"
import CodeEditor from '@uiw/react-textarea-code-editor'
import { Fab, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from "@mui/icons-material/Close"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"

/**
 * Route which allows the user to edit a script file.
 */
export const ScriptEditorRoute = props => {

    // State
    let [ searchParams, setSearchParams ] = useSearchParams()
    let [ text, setText ] = React.useState('')

    // Check if file exists
    let path = searchParams.get('path')
    let file = Playground.current.files.all.find(f => f.path == path)

    // Function to fetch the file content
    const fetchFileContent = async () => {

        // Get text
        let fileRef = await file.handle.getFile()
        let text = await fileRef.text()

        // Set text if it's changed
        setText(text)

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

    // Called when the text changes
    const onTextChanged = async e => {

        // Get new text
        let text = e.target.value

        // Update state
        setText(text)

        // Update file content
        await file.setContent(text, 1000)

    }

    // Called when the user wants to run the script
    const runScript = () => file.execute()

    // Render UI
    return <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        <CodeEditor
            value={text}
            language="js"
            onChange={onTextChanged}
            padding={15}
            data-color-mode="light"
            style={{
                fontSize: 14,
                backgroundColor: "transparent",
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                minHeight: '100%'
            }}
        />

        {/* Action menu */}
        <SpeedDial sx={{ position: 'fixed', bottom: 16, right: 16 }} ariaLabel="Script menu" icon={<SpeedDialIcon icon={<MoreHorizIcon />} openIcon={<CloseIcon />} />}>
            <SpeedDialAction icon={<PlayArrowIcon />} tooltipTitle={"Run"} onClick={runScript} />
        </SpeedDial>

    </div>

}