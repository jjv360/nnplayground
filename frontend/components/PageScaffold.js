import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Playground } from '../code/Playground'

/** Displays the defautl sidebar and content area for screens */
export const PageScaffold = props => {

    // Get current location
    let location = useLocation()
    let navigate = useNavigate()

    // If requires a loaded playground, check if one is loaded and go to the start page if not
    React.useEffect(() => {
        if (!Playground.current) navigate('/')
    }, [])
    if (!Playground.current) return <></>

    // Render UI
    return <>

        {/* Left sidebar */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 200, height: '100%', borderRight: '1px solid #DDD', overflowX: 'hidden', overflowY: 'auto' }}>

            {/* Logo */}
            <img src={require('../resources/icon-app.svg')} style={{ display: 'block', width: 64, height: 64, margin: '40px auto 20px auto' }} draggable="false" />
            <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>NNPlayground</div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#999' }}>v{require('../../package.json').version}</div>

            {/* Input */}
            <SectionHeader title="Input" />
            <ListItem title="Datasets" selected={location.pathname == '/datasets'} onClick={() => navigate('/datasets')} />
            <ListItem title="Columns" selected={location.pathname == '/columns'} onClick={() => navigate('/columns')} />

            {/* Transformation */}
            <SectionHeader title="Transformation" />
            <ListItem title="Models" selected={location.pathname == '/models'} onClick={() => navigate('/models')} />

            {/* Output */}
            <SectionHeader title="Output" />
            <ListItem title="Executions" selected={location.pathname == '/executions'} onClick={() => navigate('/executions')} />
            <ListItem title="History" selected={location.pathname == '/history'} onClick={() => navigate('/history')} />

            {/* Settings */}
            <SectionHeader title="Settings" />
            <ListItem title="Scripts" selected={location.pathname == '/scripts'} onClick={() => navigate('/scripts')} />
            <ListItem title="Plugins" selected={location.pathname == '/plugins'} onClick={() => navigate('/plugins')} />
            <ListItem title="Backends" selected={location.pathname == '/backends'} onClick={() => navigate('/backends')} />

        </div>

        {/* Right panel */}
        <div style={{ position: 'absolute', top: 0, left: 201, width: 'calc(100% - 201px)', height: '100%', overflow: 'hidden' }}>

            {/* Child components */}
            {props.children}

        </div>

    </>

}

/** Section header */
const SectionHeader = props => <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', color: '#888', padding: '32px 20px 4px 20px' }}>{props.title}</div>

/** List item */
const ListItem = props => {

    // State
    let [ isHovering, setHovering ] = React.useState(false)

    // Render UI
    return <div 
        style={{ 
            backgroundColor: props.selected ? 'rgba(0, 128, 255, 1)' : (isHovering ? 'rgba(0, 128, 255, 0.1)' : 'rgba(0, 128, 255, 0.0)'), 
            color: props.selected ? '#FFF' : (isHovering ? '#000' : '#888'),
            padding: '6px 10px', 
            margin: '5px 10px', 
            borderRadius: 4 
        }}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onClick={props.onClick}>
            
        {/* Icon */}
        { props.icon ? 
            <img src={props.icon} style={{ width: 16, height: 16 }} />
        : null }

        {/* Label */}
        { props.title ?
            <span style={{ fontSize: 12, fontWeight: 'bold' }}>{props.title}</span>
        : null }

    </div>

}