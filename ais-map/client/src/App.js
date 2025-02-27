import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const mapStyle = { height: "100vh", width: "100%" };
const AIS_STREAM_URL = "wss://awake-vitality-production.up.railway.app"; // Replace with Railway WebSocket URL
const API_KEY = "379f727dd8ee90352708c468ba7c5604bba3566d"; // Replace with your actual API key

const Map = () => {
  const [ships, setShips] = useState([]);
  let socket; // WebSocket instance

  useEffect(() => {
    let socket;
    let reconnectTimeout;
  
    const connectWebSocket = () => {
      console.log("🔗 Connecting to WebSocket...");
      socket = new WebSocket(AIS_STREAM_URL);
  
      socket.onopen = () => {
        console.log("✅ Connected to WebSocket");
        const message = {
          Apikey: API_KEY,
          BoundingBoxes: [[[-180, -90], [180, 90]]], // Global coverage
          FilterMessageTypes: ["PositionReport"],
        };
        socket.send(JSON.stringify(message));
  
        // Keep the connection alive
        setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };
  
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data); // ✅ Try parsing as JSON
          if (data && data.messages) {
            const shipsData = data.messages
              .filter(ship => ship.latitude !== undefined && ship.longitude !== undefined)
              .slice(0, 50); // Limit to 50 ships
            setShips(shipsData);
          }
        } catch (error) {
          console.warn("⚠️ Received non-JSON message:", event.data); // Log non-JSON messages
        }
      };
      
  
      socket.onerror = (error) => {
        console.error("⚠️ WebSocket Error:", error);
      };
  
      socket.onclose = () => {
        console.warn("⚠️ WebSocket closed. Reconnecting...");
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connectWebSocket, 5000); // Reconnect after 5s
      };
    };
  
    connectWebSocket();
  
    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, []);
  

  return (
    <MapContainer center={[0, 0]} zoom={2} style={mapStyle}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {ships.map((ship, index) => (
        <Marker key={index} position={[ship.latitude, ship.longitude]}>
          <Popup>
            <b>MMSI:</b> {ship.mmsi}<br />
            <b>Speed:</b> {ship.speedOverGround} knots<br />
            <b>Course:</b> {ship.courseOverGround}°
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
