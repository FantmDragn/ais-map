const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 3000 });

server.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.send('Connected to AIS WebSocket Server');
});

console.log('WebSocket server running...');
