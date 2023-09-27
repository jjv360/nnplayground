import React, { useEffect, useState } from 'react'
import { ItemListPage } from '../components/SimpleComponents'
import { Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Step, StepButton, StepLabel, Stepper, Typography } from '@mui/material'
import { Playground } from '../code/Playground'
import { usePlaygroundUpdates } from '../components/hooks'

/** Allows creating a model */
export const NewModelRoute = props => {

    // State
    let [ createDialogOpen, setCreateDialogOpen ] = useState(false)
    let [ page, setPage ] = useState(0)

    // Watch for playground updates
    usePlaygroundUpdates()

    // 

    // Map files to rows
    const rows = []

    // Create columns for the table
    const columns = [
        { field: 'name', headerName: 'Column Name', flex: true },
    ]

    // Render UI
    return <>
    
        {/* Content area */}
        <div style={{ flex: '1 1 1px', overflowX: 'hidden', overflowY: 'auto' }}>

            {/* Stepper */}
            <Stepper activeStep={page} nonLinear alternativeLabel style={{ marginTop: 40 }}>
                <Step>
                    <StepButton onClick={() => setPage(0)}>Model type</StepButton>
                </Step>
                <Step>
                    <StepButton onClick={() => setPage(1)}>Inputs</StepButton>
                </Step>
                <Step>
                    <StepButton onClick={() => setPage(2)}>Configuration</StepButton>
                </Step>
                <Step>
                    <StepButton onClick={() => setPage(3)}>Outputs</StepButton>
                </Step>
            </Stepper>

            {/* Select model type page */}
            { page == 0 ? <ModelTypeSelector /> : null }

            {/* Select model type page */}
            { page == 0 ? <ModelTypeSelector /> : null }

            {/* Select inputs page */}
            { page == 1 ? <>

                Inputs

            </> : null }

        </div>

        {/* Footer */}
        <div style={{ flex: '0 0 auto', padding: 20, display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #DDD' }}>

            {/* Cancel button */}
            { page == 0 ? 
                <Button variant="outlined" onClick>Cancel</Button>
            :
                <Button variant="outlined" onClick={setPage(page-1)}>Back</Button>
            }

            {/* Next button */}
            <Button variant="contained" color="primary">Next</Button>

        </div>

    </>

}



















/** Component to select the model type */
const ModelTypeSelector = props => {

    // Render UI
    return <div style={{ marginTop: 40, padding: 20, gap: 20, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Timeseries option */}
        <Card sx={{ width: 300, backgroundColor: 'rgba(0, 128, 255, 0.2)', cursor: 'pointer' }}>
            {/* <CardMedia component="img" height="180" image="https://mui.com/static/images/cards/contemplative-reptile.jpg" alt="green iguana" /> */}
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Timeseries Prediction
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    A sequential TensorFlow model that predicts future values of a timeseries.
                </Typography>
            </CardContent>
        </Card>

    </div>

}
















/** Component to select the model inputs */
const ModelInputSelector = props => {

    // Render UI
    return <>Inputs</>

}
















/** Component to select the model configuraiton */
const ModelConfigurationSelector = props => {

    // Render UI
    return <>Config</>

}
















/** Component to select the model outputs */
const ModelOutputSelector = props => {

    // Render UI
    return <>Outputs</>

}