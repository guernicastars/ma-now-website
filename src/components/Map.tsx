"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix for default Leaflet icons in Next.js/React
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const locations = [
  { name: "New York", coords: [40.7128, -74.006] as [number, number] },
  { name: "London", coords: [51.5074, -0.1278] as [number, number] },
  { name: "Berlin", coords: [52.52, 13.405] as [number, number] },
  { name: "Paris", coords: [48.8566, 2.3522] as [number, number] },
  { name: "Rome", coords: [41.9028, 12.4964] as [number, number] },
  { name: "Madrid", coords: [40.4168, -3.7038] as [number, number] },
];

export default function Map() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-500">
        Loading Map...
      </div>
    );
  }

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={3}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker key={loc.name} position={loc.coords} icon={customIcon}>
          <Popup>
            <span className="font-semibold">{loc.name}</span> <br /> Negotiation Hub
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
