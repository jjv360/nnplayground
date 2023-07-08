import React from 'react'
import { ItemListPage } from '../components/SimpleComponents'

/** Displays the list of available backends */
export const BackendsRoute = props => {

    // Check for WebGL support
    let [ supportsWebGL, setSupportsWebGL ] = React.useState(false)
    React.useEffect(() => {

        // Check for WebGL support
        let canvas = document.createElement('canvas')
        let gl = canvas.getContext('webgl')
        setSupportsWebGL(gl != null)

    }, [])

    // Check for WebGPU support
    let supportsWebGPU = navigator.gpu

    // Create columns for the table
    const columns = [
        { field: 'name', headerName: 'Name', flex: true },
        { field: 'deviceType', headerName: 'Device', width: 150 },
        { field: 'address', headerName: 'Address', width: 300 },
        { field: 'status', headerName: 'Status', width: 150 }
    ]

    // Map files to rows
    const rows = [
        { id: 0, name: 'TensorFlow.js WASM', deviceType: 'CPU', address: 'internal://tfjs/wasm', status: 'Available' },
        { id: 1, name: 'TensorFlow.js WebGL', deviceType: 'GPU', address: 'internal://tfjs/webgl', status: supportsWebGL ? 'Available' : 'Unavailable' },
        { id: 2, name: 'TensorFlow.js WebGPU', deviceType: 'GPU', address: 'internal://tfjs/webgpu', status: supportsWebGPU ? 'Available' : 'Unavailable' },
    ]

    // Render UI
    return <ItemListPage 
        rows={rows}
        columns={columns}
        noItemsTitle="No backends found" 
        noItemsDescription="This should never happen!"
    />

}