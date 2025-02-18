import { Server } from 'ws';

export default function handler(req, res) {
    if (res.socket.server.websocket) {
        res.end();
        return;
    }

    const wss = new Server({ server: res.socket.server });
    res.socket.server.websocket = wss;

    wss.on('connection', (ws) => {
        const aisStream = new WebSocket("wss://stream.aisstream.io/v0/stream");
        
        aisStream.onopen = () => {
            aisStream.send(JSON.stringify({
                Apikey: "YOUR_AISSTREAM_API_KEY", // Replace with your actual API key
                BoundingBoxes: [[[-180, -90], [180, 90]]],
                FilterMessageTypes: ["PositionReport"]
            }));
        };

        aisStream.onmessage = (message) => {
            ws.send(message.data);
        };

        aisStream.onerror = (error) => {
            console.error("❌ AISStream Error:", error);
            ws.close();
        };

        aisStream.onclose = () => ws.close();

        ws.on('close', () => aisStream.close());
    });

    res.end();
}
