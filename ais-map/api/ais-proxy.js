import WebSocket from "ws";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  console.log("Starting WebSocket proxy...");

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
    res.write(message.data);
  };

  aisStream.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
    res.status(500).json({ error: "WebSocket connection failed" });
  };

  aisStream.onclose = () => {
    console.log("✅ WebSocket connection closed.");
    res.end();
  };
}
