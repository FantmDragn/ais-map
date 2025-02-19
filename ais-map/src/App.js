import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const mapStyle = { height: "100vh", width: "100%" };
const AIS_STREAM_URL = "wss://ais-map.vercel.app/api/ais-proxy";
const API_KEY = "379f727dd8ee90352708c468ba7c5604bba3566d"; // Replace with your actual key

const Map = () => {
  const [ships, setShips] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(AIS_STREAM_URL);

    socket.onopen = () => {
      console.log("Connected to AISStream.io WebSocket");
      // Send subscription message
      const message = {
        Apikey: API_KEY,
        BoundingBoxes: [
          [[-180, -90], [180, 90]] // Covers the whole world
        ],
        FilterMessageTypes: ["PositionReport"],
      };
      socket.send(JSON.stringify(message));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.messages) {
        const shipsData = data.messages
          .filter(ship => ship.latitude !== undefined && ship.longitude !== undefined)
          .slice(0, 50); // Limit to 50 ships
        setShips(shipsData);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("AISStream.io WebSocket closed");
    };

    return () => {
      socket.close();
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
