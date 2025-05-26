/**
 * API route handler to initialize and attach a Socket.IO server instance
 * to the Next.js custom server. Ensures that only one Socket.IO server
 * is created and reused across API route calls.
 *
 * - Disables body parsing for this API route (required for socket.io).
 * - Attaches the Socket.IO server to the HTTP server if not already present.
 * - Sets the socket.io path to "/api/socket/io".
 *
 * This enables real-time communication features in the application.
 */

// Import the Node.js HTTP server type (not directly used here, but often for typing)
import { Server as NetServer } from 'http';

// Import the Socket.IO server class
import { Server as ServerIO } from 'socket.io';

// Import Next.js API request type
import { NextApiRequest } from 'next';

// Import custom Next.js API response type with socket.io server attached
import { NextApiResponseServerIo } from '@/types';

// Export Next.js API config to disable body parsing (required for socket.io)
export const config = {
    api: {
        bodyParser: false, // Disable body parsing for socket.io
    }
}

// Main handler function for the API route
const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {

    // If a Socket.IO server is not already attached to the HTTP server...
    if (!res.socket.server.io) {
        const path = "/api/socket/io"; // Set the socket.io path
        const httpServer = res.socket.server as any; // Get the underlying HTTP server
        const io = new ServerIO(httpServer, { // Create a new Socket.IO server
            path, // Use the specified path

            // @ts-ignore
            addTrailingSlash: false, // (Optional) Remove trailing slash from path
        });
        res.socket.server.io = io; // Attach the Socket.IO server to the HTTP server
    }

    res.end(); // End the API response (no content needed)
}

// Export the handler as default for Next.js API route
export default ioHandler;