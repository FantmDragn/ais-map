import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const mapStyle = { height: "100vh", width: "100%" };
const AIS_API = "https://opensky-network.org/api/states/all";

const Map = () => {
  const [ships, setShips] = useState([]);

  useEffect(() => {
    const fetchAISData = async () => {
      try {
        const response = await axios.get(AIS_API);
        const data = response.data.states;
        setShips(data.slice(0, 50)); // Limit to 50 ships
      } catch (error) {
        console.error("Error fetching AIS data:", error);
      }
    };

    fetchAISData();
    const interval = setInterval(fetchAISData, 30000); // Refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={[0, 0]} zoom={2} style={mapStyle}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {ships.map((ship, index) => (
        <Marker key={index} position={[ship[6], ship[5]]}>
          <Popup>
            <b>Callsign:</b> {ship[1]}<br />
            <b>Country:</b> {ship[2]}<br />
            <b>Altitude:</b> {ship[7]}m
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
