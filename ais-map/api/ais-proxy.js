import { WebSocketServer } from "ws";
import { createServer } from "http";

export default function handler(req, res) {
  if (!req.socket.server.wss) {
    console.log("Starting WebSocket proxy...");

    const server = createServer();
    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });

    wss.on("connection", (ws) => {
      console.log("Client connected to WebSocket proxy.");

      const aisStream = new WebSocket("wss://stream.aisstream.io/v0/stream");

      aisStream.onopen = () => {
        console.log("✅ Connected to AISStream.io");
        aisStream.send(
          JSON.stringify({
            Apikey: "379f727dd8ee90352708c468ba7c5604bba3566d", // Replace with your real API key
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

    req.socket.server.wss = wss;
  }

  res.end();
}
