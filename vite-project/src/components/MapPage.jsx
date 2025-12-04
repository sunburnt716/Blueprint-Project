import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import EventMarker from "./EventMarker"; // Correct import
import ClubSearch from "./ClubSearch";
import LoginModal from "./LoginModal";

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

export default function MapPage() {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [trackedClubs, setTrackedClubs] = useState([]); // usernames of followed clubs

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // TEMP: For adding clubs locally for testing
  const addClubForTest = (username) => {
    if (!trackedClubs.includes(username)) {
      setTrackedClubs((prev) => [...prev, username]);
      console.log(`[TEST MODE] Added club: ${username}`);
    }
  };

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
      <div className="search-overlay">
        <ClubSearch user={user} onAddClub={addClubForTest} />
      </div>

      <div ref={mapRef} style={containerStyle}></div>

      {/* Event markers */}
      {mapInstance && (
        <EventMarker map={mapInstance} trackedClubs={trackedClubs} />
      )}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        setUser={setUser}
      />
      <div
        className="test-list-overlay"
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        <strong>[TEST] Tracked:</strong>
        <ul>
          {trackedClubs.map((club) => (
            <li key={club}>{club}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
