import { useSearchParams } from "react-router-dom"
import React from "react"

/**
 * Route which allows the user to chat to a chat model.
 */
export const ChatRoute = props => {

    // State
    let [ searchParams, setSearchParams ] = useSearchParams()

    // Render UI
    return <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        
        {/* Chat scrollable area */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'calc(100% - 60px)', overflowX: 'hidden', overflowY: 'auto' }}>

        </div>

        {/* Control bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 60, borderTop: '1px solid #DDD', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>



        </div>

    </div>

}