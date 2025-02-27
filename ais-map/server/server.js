const WebSocket = require("ws");
const http = require("http");

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "text/plain" });
  res.end("WebSocket upgrade required");
});

// Create WebSocket server with explicit upgrade handling
const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  console.log("🔄 Upgrade request received"); // Log upgrade attempts
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});


wss.on("connection", (ws) => {
  console.log("✅ New WebSocket client connected");

  ws.send(JSON.stringify({ message: "Connected to WebSocket Server ✅" })); // Send welcome message

  ws.on("message", (message) => {
    console.log(`📩 Received from client: ${message}`); // Log received messages
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });

  // Simulate AIS ship data every 5 seconds
  setInterval(() => {
    const shipData = {
      messages: [
        { mmsi: 123456789, latitude: 37.7749, longitude: -122.4194, speedOverGround: 12.3, courseOverGround: 90 },
        { mmsi: 987654321, latitude: 34.0522, longitude: -118.2437, speedOverGround: 15.0, courseOverGround: 180 },
      ],
    };

    ws.send(JSON.stringify(shipData)); // Send ship data
    console.log("🚢 Sent Ship Data:", shipData);
  }, 5000); // Every 5 seconds
});


// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});
