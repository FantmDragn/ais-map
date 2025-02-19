import { WebSocketServer } from "ws";

export default function handler(req, res) {
  if (req.headers.upgrade !== "websocket") {
    res.status(400).json({ error: "Expected WebSocket connection" });
    return;
  }

  if (!global.wss) {
    console.log("Starting WebSocket proxy...");

    global.wss = new WebSocketServer({ noServer: true });

    global.wss.on("connection", (ws) => {
      console.log("Client connected to WebSocket proxy.");

      const aisStream = new WebSocket("wss://stream.aisstream.io/v0/stream");

      aisStream.onopen = () => {
        console.log("✅ Connected to AISStream.io");
        aisStream.send(
          JSON.stringify({
            Apikey: "379f727dd8ee90352708c468ba7c5604bba3566d", // Replace with your actual key
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

    console.log("WebSocket server started.");
  }

  res.end();
}
