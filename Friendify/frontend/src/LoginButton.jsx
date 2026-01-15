import React from "react";

export default function LoginButton() {
  const handleLogin = () => {
    // Redirect directly to backend login endpoint
    window.location.href = "https://reprints-flush-conversion-thee.trycloudflare.com/api/spotify/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Friendify</h1>
      <button 
        onClick={handleLogin} 
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "5px",
          backgroundColor: "#1DB954",
          color: "white",
          border: "none"
        }}
      >
        Login with Spotify
      </button>
    </div>
  );
}
