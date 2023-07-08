import React from 'react'

/** Menubar */
export const Menubar = props => {

    // Render UI
    return <div style={{ backgroundColor: '#222', position: 'absolute', top: 0, left: 0, width: '100%', height: 36, display: 'flex', flexDirection: 'row', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)' }}>
        {props.children}
    </div>

}

/** Icon menubar item */
export const MenubarItem = props => {

    // State
    let [ isHovering, setHovering ] = React.useState(false)

    // Render UI
    return <div style={{ display: 'inline-block', backgroundColor: isHovering ? '#333' : 'transparent', padding: '8px 16px' }}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}>
            
        {/* Icon */}
        { props.icon ? 
            <img src={props.icon} style={{ width: 16, height: 16 }} />
        : null }

        {/* Label */}
        { props.title ?
            <span style={{ color: '#fff', fontSize: 13 }}>{props.title}</span>
        : null }

    </div>

}