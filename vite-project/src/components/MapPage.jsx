import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { onAuthStateChanged } from "firebase/auth";

import { auth, addTrackedAccount, getUserTrackedAccounts } from "../firebase.js";

import EventMarker from "./EventMarker";
import AccountSearch from "./AccountSearch";
import LoginModal from "./LoginModal";

import '../App.css';

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
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [localAccounts, setLocalAccounts] = useState(() => {
    const saved = localStorage.getItem("localAccounts");
    return saved ? JSON.parse(saved) : [];
  });
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Auth and Firestore stuff
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      if (!currentUser) return;

      // Load cloud accounts once
      const cloud = await getUserTrackedAccounts(currentUser.uid);

      // Merge local and cloud accounts
      const merged = Array.from(new Set([...localAccounts, ...cloud]));
      setLocalAccounts(merged);

      // Write merged accounts back to cloud
      for (const acct of merged) {
        await addTrackedAccount(currentUser.uid, acct);
      }
    });
    return () => unsub();
  }, [setUser]);

  // Local storage stuff
  useEffect(() => {
    localStorage.setItem("localAccounts", JSON.stringify(localAccounts));
  }, [localAccounts]);

  // Map stuff
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
      <button className="open-login-btn" onClick={() => setShowLogin(true)}>
        {user ? "Account" : "Log In"}
      </button>

      <LoginModal
        user={user}
        isOpen={showLogin}
        onClose={() => setShowLogin(false)} />

      <AccountSearch
        user={user}
        onAddAccount={(account) => {
          setLocalAccounts((prev) => {
            const updated = prev.includes(account) ? prev : [...prev, account];
            console.log(`Added @${account} to local accounts.`);
            return updated;
          });
          // Cloud sync is handled in AccountSearch
        }}/>

      <div ref={mapRef} style={containerStyle}></div>

      {/* Event markers */}
      {mapInstance && (
        <EventMarker map={mapInstance} trackedAccounts={localAccounts} />
      )}
      
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
          {localAccounts.map((account) => (
            <li key={account}>{account}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
