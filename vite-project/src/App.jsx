import { useState, useEffect } from "react";
import { auth, addTrackedAccount, getUserTrackedAccounts } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

import LoginModal from "./components/LoginModal.jsx";
import MapPage from "./components/MapPage.jsx";
import AccountSearch from "./components/AccountSearch.jsx";

import './App.css';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [localAccounts, setLocalAccounts] = useState(() => {
    const saved = localStorage.getItem("localAccounts");
    return saved ? JSON.parse(saved) : [];
  })

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

  useEffect(() => {
    localStorage.setItem("localAccounts", JSON.stringify(localAccounts));
  }, [localAccounts]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapPage user={user}/>

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

      <button className="open-login-btn" onClick={() => setShowLogin(true)}>
        {user ? "Account" : "Log In"}
      </button>

      <LoginModal
        user={user}
        isOpen={showLogin}
        onClose={() => setShowLogin(false)} />
    </div>
  );
}