import { WebSocketServer } from "ws";

export default function handler(req, res) {
  if (!res.socket.server.wss) {
    console.log("Starting WebSocket proxy...");

    const wss = new WebSocketServer({ noServer: true });

    wss.on("connection", (ws) => {
      console.log("Client connected to WebSocket proxy.");

      const aisStream = new WebSocket("wss://stream.aisstream.io/v0/stream");

      aisStream.onopen = () => {
        console.log("✅ Connected to AISStream.io");
        aisStream.send(
          JSON.stringify({
            Apikey: "YOUR_AISSTREAM_API_KEY", // Replace with your actual key
            BoundingBoxes: [[[-180, -90], [180, 90]]],
            FilterMessageTypes: ["PositionReport"],
          })
        );
      };

      aisStream.onmessage = (message) => {
        ws.send(message.data);
      };

      aisStream.onerror = (error) => {
        console.error("❌ AISStream.io WebSocket error:", error);
        ws.close();
      };

      aisStream.onclose = () => ws.close();

      ws.on("close", () => {
        console.log("Client disconnected from proxy.");
        aisStream.close();
      });
    });

    res.socket.server.wss = wss;
  }

  res.end();
}
