import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { onAuthStateChanged } from "firebase/auth";

import { auth, addTrackedAccount, getUserTrackedAccounts } from "../firebase.js";

import EventMarker from "./EventMarker.jsx";
import AccountSearch from "./AccountSearch.jsx";
import LoginModal from "./LoginModal.jsx";

import '../App.css';

// Google Maps libraries
const LIBRARIES = ["marker"];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 40.5184740017725,
  lng: -74.45309900288558,
};

export default function MapPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [localAccounts, setLocalAccounts] = useState(() => {
    const saved = localStorage.getItem("localAccounts");
    return saved ? JSON.parse(saved) : [];
  });
  const [mapInstance, setMapInstance] = useState(null);
  const mapRef = useRef(null);
  const listenerRegistered = useRef(false);

  // Auth and Firestore stuff
  useEffect(() => {
    if (listenerRegistered.current) return;
    listenerRegistered.current = true;

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      console.log("[MapPage] Auth state changed:", currentUser);
      setUser(currentUser);
      if (!currentUser) return;

      // Load cloud accounts once
      const cloud = await getUserTrackedAccounts(currentUser.uid);
      // Merge local and cloud accounts
      setLocalAccounts((prev) => {
        const merged = Array.from(new Set([...prev, ...cloud]));
        console.log("[MapPage] Merged local and cloud accounts:", merged);
        // Push merged accounts to Firestore
        merged.forEach(async (acct) => {
          await addTrackedAccount(currentUser.uid, acct);
        });
        return merged;
      });
      return () => unsub();
    });
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
        trackedAccounts={localAccounts}
        onAddAccount={(account) => {
          setLocalAccounts((prev) => {
            const updated = prev.includes(account) ? prev : [...prev, account];
            console.log(`[MapPage: AccountSearch prop] Added @${account} to local accounts.`);
            return updated;
          });
          // Cloud sync is handled in AccountSearch
        }}
        onRemoveAccount={(account) => {
          setLocalAccounts((prev) => {
            const updated = prev.filter((prev) => prev !== account);
            console.log(`[MapPage: AccountSearch prop] Removed @${account} from local accounts.`);
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
          color: "black",
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
