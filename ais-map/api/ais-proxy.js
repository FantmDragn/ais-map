import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket proxy.");

  const aisStream = new WebSocket("wss://stream.aisstream.io/v0/stream");

  aisStream.onopen = () => {
    console.log("✅ Connected to AISStream.io");
    aisStream.send(
      JSON.stringify({
        Apikey: process.env.AISSTREAM_API_KEY, // Store API key in Heroku config vars
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

// Define a simple HTTP route
app.get("/", (req, res) => {
  res.send("WebSocket proxy is running!");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
