/**
 * Handles the server part of a remote backend connection.
 */
export class BackendConection {

    /** @type {ReadableStream} The read stream */
    readStream = null

    /** @type {WritableStream} The write stream */
    writeStream = null

    /** Promise which resolves when the connection is closed */
    waitForEnd = new Promise((resolve, reject) => {
        this._end = resolve
        this._error = reject
    })

    /** Construct with a ReadStream and a WriteStream */
    static withStreams(readStream, writeStream) {

        // Create connection
        let conn = new BackendConection(readStream, writeStream)
        conn.readStream = readStream
        conn.writeStream = writeStream

        // Start processing data
        conn.start()

        // Return it
        return conn

    }

    /** @private Start processing incoming requests */
    async start() {

        // Catch errors
        try {

            // Get reader
            let reader = this.readStream.getReader()

            // Load data loop
            let buffer = ''
            for await (let chunk of reader) {

                console.log('stream in', chunk)

            }

            // Done
            this._end()

        } catch (err) {

            // Connection failed
            console.warn(`[BackendConnection] Connection failed: `, err)
            this._error(err)

        }

    }

}