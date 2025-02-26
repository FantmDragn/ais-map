const WebSocket = require("ws");
const http = require("http");

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "text/plain" });
  res.end("WebSocket upgrade required");
});

// Create WebSocket server on the same port
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.send("Connected to AIS WebSocket Server");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
