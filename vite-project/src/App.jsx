import { useState } from "react";
import MapPage from "./components/MapPage.jsx";
import LoginModal from "./components/LoginModal.jsx";
import { auth } from "./firebase.js";
import UploadPage from "./pages/UploadPage.jsx";

export default function App() {
  const [user, setUser] = useState(auth.currentUser); // track logged-in user
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false); // toggle UploadPage

  const handleUploadClick = () => {
    if (!user) {
      setShowLogin(true); // Prompt login if not logged in
    } else {
      setShowUpload(true); // Show the upload page if logged in
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* Login / Account button */}
      <button
        className="open-login-btn"
        onClick={() => setShowLogin(true)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 1000,
          padding: "10px 15px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {user ? "Account" : "Log In"}
      </button>

      {/* Upload Events button under the Login button */}
      <button
        className="upload-btn"
        onClick={handleUploadClick}
        style={{
          position: "absolute",
          top: 70, // moves it below the login button
          right: 20,
          zIndex: 1000,
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Upload Events
      </button>

      {/* Conditionally render either the Map or UploadPage */}
      {showUpload && user ? (
        <UploadPage user={user} onClose={() => setShowUpload(false)} />
      ) : (
        <MapPage />
      )}

      {/* Login modal */}
      <LoginModal
        user={user}
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </div>
  );
}
