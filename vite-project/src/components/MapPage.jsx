import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import EventMarker from "./EventMarker";

import "../App.css";

// Google Maps libraries
const LIBRARIES = ["marker"];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 40.7128,
  lng: -74.006,
};

export default function MapPage({ user }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Load Google Map
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
    });

    setMapInstance(map);
  }, [isLoaded]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Map container */}
      <div ref={mapRef} style={containerStyle}></div>

      {/* Event markers */}
      {mapInstance && <EventMarker map={mapInstance} user={user} />}
    </div>
  );
}
