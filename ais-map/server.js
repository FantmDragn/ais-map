const WebSocket = require("ws");
const http = require("http");

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running.");
});

// Create a WebSocket server and bind it to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.send("Connected to AIS WebSocket Server");
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ WebSocket server running on port ${PORT}`);
});
