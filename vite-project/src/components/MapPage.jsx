import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import ClubSearch from "./AccountSearch";
import LoginModal from "./LoginModal";

// Static libraries array to avoid the warning
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
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // TEMPORARY: Simple array to hold followed usernames for testing
  const [trackedClubs, setTrackedClubs] = useState([]); 

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // TEMPORARY: Adds club to state list for testing
  const addClubForTest = (username) => {
    if (!trackedClubs.includes(username)) {
      setTrackedClubs(prev => [...prev, username]);
      console.log(`[TEST MODE] Added club: ${username}`);
    } else {
      console.log(`[TEST MODE] Club already tracked: ${username}`);
    }
  };

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = mapRef.current.state.map;

    const { AdvancedMarkerElement } = google.maps.marker;

    new AdvancedMarkerElement({
      map,
      position: center,
      title: "Hello world!",
    });
  }, [isLoaded]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div className="search-overlay">
        <ClubSearch 
          user={user} 
          onAddClub={addClubForTest} // 💡 PASSING TEST FUNCTION
        />
      </div>

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={(map) => {
            mapRef.current = { state: { map } };
          }}
        />
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        setUser={setUser}
      />
      
      {/* 💡 TEMPORARY: Display the list of tracked clubs for testing verification */}
      <div className="test-list-overlay" style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <strong>[TEST] Tracked:</strong>
        <ul>
          {trackedClubs.map(club => <li key={club}>{club}</li>)}
        </ul>
      </div>
    </div>
  );
}