import React from 'react'
import ReactDOM from 'react-dom/client'
import { Menubar, MenubarItem } from './components/Menubar'
import { HashRouter, Route, Routes } from "react-router-dom"
import { PageScaffold } from './components/PageScaffold'
import { FullscreenNotice } from './components/SimpleComponents'
import { DatasetsRoute } from './routes/DatasetsRoute'
import { StartPageRoute } from './routes/StartPageRoute'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Playground } from './code/Playground'
import Swal from 'sweetalert2'
import { Tasks } from './code/Tasks'
import { BackendsRoute } from './routes/BackendsRoute'
import { ScriptsRoute } from './routes/ScriptsRoute'
import { ScriptEditorRoute } from './routes/ScriptEditorRoute'
 
// Main app component
const App = props => {

    // Called when the user drags a file over the window
    const onDragOver = e => {
        e.preventDefault()
    }

    // Called when the user drops a file over the window
    const onDrop = e => {
        e.preventDefault()

        // If no playground loaded, show error
        if (!Playground.current) 
            return Swal.fire({ icon: 'error', title: 'No playground loaded', text: 'Please load a playground first' })

        // Create a task to store files
        let files = Array.from(e.dataTransfer.files)
        Playground.current.files.store(files)

    }
    
    // Render UI
    return <div onDragOver={onDragOver} onDrop={onDrop}>
    
        {/* App routes */}
        <HashRouter>
            <Routes>
                <Route path="/datasets" element={<PageScaffold><DatasetsRoute /></PageScaffold>} />
                <Route path="/columns" element={<PageScaffold><FullscreenNotice icon={require('./resources/icon-error.svg')} title="No route" description="Not implemented" /></PageScaffold>} />
                <Route path="/models" element={<PageScaffold><FullscreenNotice icon={require('./resources/icon-error.svg')} title="No route" description="Not implemented" /></PageScaffold>} />
                <Route path="/executions" element={<PageScaffold><FullscreenNotice icon={require('./resources/icon-error.svg')} title="No route" description="Not implemented" /></PageScaffold>} />
                <Route path="/history" element={<PageScaffold><FullscreenNotice icon={require('./resources/icon-error.svg')} title="No route" description="Not implemented" /></PageScaffold>} />
                <Route path="/scripts" element={<PageScaffold><ScriptsRoute /></PageScaffold>} />
                <Route path="/script/edit" element={<PageScaffold><ScriptEditorRoute /></PageScaffold>} />
                <Route path="/plugins" element={<PageScaffold><FullscreenNotice icon={require('./resources/icon-error.svg')} title="No route" description="Not implemented" /></PageScaffold>} />
                <Route path="/backends" element={<PageScaffold><BackendsRoute /></PageScaffold>} />
                <Route path="*" element={<StartPageRoute />} />
            </Routes>
        </HashRouter>

        {/* Toast container */}
        <ToastContainer />

    </div>
    
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />)

// Prevent some keyboard shortcuts
window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key == 's') e.preventDefault()
})