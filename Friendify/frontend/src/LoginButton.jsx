import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

export default function LoginButton() { // Page to redirect to login with spotify or access info page
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href =
      "https://cds-jersey-beings-sterling.trycloudflare.com/api/spotify/login";
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#121212";
    document.body.style.border = "10px solid #1DB954";
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        color: "#FFFFFF",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "50px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "400" }}>
          Welcome to
        </h2>

        <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
          <img
            src={logo}
            alt="Friendify Logo"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "12px",
              marginRight: "15px",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#1DB954",
            }}
          >
            Friendify
          </h1>
        </div>
      </div>

      <button
        onClick={handleLogin}
        style={{
          padding: "15px 40px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "50px",
          backgroundColor: "transparent",
          color: "#1DB954",
          border: "2px solid #1DB954",
          fontWeight: "600",
          transition:
            "transform 0.2s, box-shadow 0.2s, background-color 0.2s, color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow =
            "0 4px 20px rgba(29, 185, 84, 0.5)";
          e.currentTarget.style.backgroundColor = "#1DB954";
          e.currentTarget.style.color = "#FFFFFF";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#1DB954";
        }}
      >
        Login with Spotify
      </button>

      <button
        onClick={() => navigate("/help")}
        style={{
          marginTop: "25px",
          background: "none",
          border: "none",
          color: "#1DB954",
          cursor: "pointer",
          fontSize: "0.95rem",
          textDecoration: "underline",
        }}
      >
        About Friendify / Request Access
      </button>

      <p style={{ marginTop: "40px", fontSize: "0.9rem", color: "#AAAAAA" }}>
        Powered by Spotify API
      </p>
    </div>
  );
}
