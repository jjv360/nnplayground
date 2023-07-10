import React from 'react'
import { Playground } from '../code/Playground'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { FullscreenNotice } from '../components/SimpleComponents'
import { TaskManager } from '../code/TaskManager'
import { Button } from '@mui/material'

/** Displayed on startup */
export const StartPageRoute = props => {

    // Actions
    let navigate = useNavigate()

    // On click: Create or Open button
    let openPlayground = () => TaskManager.shared.build().name("Loading playground").action(async () => {

        // Select folder to use
        let folder = await window.showDirectoryPicker({
            id: 'playground',
            mode: 'readwrite',
            startIn: 'documents'
        })

        // Check if this folder already contains a playground
        if (await Playground.existsAt(folder)) {

            // Load it
            await Playground.open(folder)

        } else {

            // Confirm with the user
            let result = await Swal.fire({
                icon: 'question',
                title: 'Create new playground?',
                text: 'This folder does not contain a playground yet. Do you want to create a new playground here?',
                showCancelButton: true,
                confirmButtonText: 'Create',
                cancelButtonText: 'Cancel'
            })

            // Check result
            if (!result.isConfirmed)
                return

            // Create it
            await Playground.create(folder)

        }

        // Go to datasets page
        navigate('/files')

    }).schedule()

    // Render UI
    return <FullscreenNotice icon={require('../resources/icon-app.svg')} title="NNPlayground" description="A tool to experiment with deep learning.">

        {/* Actions */}
        <Button variant="outlined" onClick={openPlayground}>Create or Open</Button>
        {/* <Button title='Open existing' /> */}

    </FullscreenNotice>

}