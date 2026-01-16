import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "./assets/logo.png";
import axios from "axios";

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const spotifyUserId = searchParams.get("spotifyUserId");
  const [displayName, setDisplayName] = useState("User"); // fallback

  // Remove default margin and set background color
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#121212";
  }, []);

  // -------------------------
  // Fetch the current user's display name using Spotify ID
  // -------------------------
  useEffect(() => {
    if (!spotifyUserId) return;

    const fetchDisplayName = async () => {
      try {
        const res = await axios.get(`http://localhost:5139/api/friends/user`, {
          params: { spotifyUserId },
        });

        if (res.data && res.data.displayName) {
          setDisplayName(res.data.displayName);
        } else {
          setDisplayName("User");
        }
      } catch (err) {
        console.error("Error fetching display name", err);
        setDisplayName("User");
      }
    };

    fetchDisplayName();
  }, [spotifyUserId]);

  if (!spotifyUserId) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#121212",
          color: "#FFFFFF",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: "1.2rem",
        }}
      >
        Missing Spotify user ID.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "#121212",
        color: "#FFFFFF",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "10px solid #1DB954", // Green border
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Friendify Logo Header Top-Left */}
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          position: "absolute",
          top: "2rem",
          left: "2rem",
        }}
      >
        <img
          src={logo}
          alt="Friendify Logo"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            marginRight: "10px",
          }}
        />
        <span style={{ fontSize: "1.8rem", fontWeight: "700", color: "#1DB954" }}>
          Friendify
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginTop: "4rem", marginBottom: "3rem" }}>
        <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "400" }}>Welcome</h2>
        <h1
          style={{
            margin: "0.5rem 0 0 0",
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#1DB954",
          }}
        >
          {displayName || "Loading..."}
        </h1>
      </div>

      {/* Main Navigation Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => navigate(`/top-tracks?spotifyUserId=${spotifyUserId}`)}
          style={{
            padding: "15px 35px",
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
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(29, 185, 84, 0.5)";
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
          Top Tracks
        </button>

        <button
          onClick={() => navigate(`/friends?spotifyUserId=${spotifyUserId}`)}
          style={{
            padding: "15px 35px",
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
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(29, 185, 84, 0.5)";
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
          Friends
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: "2rem",
          padding: "0.5rem 1rem",
          borderRadius: "50px",
          backgroundColor: "transparent",
          color: "#1DB954",
          border: "2px solid #1DB954",
          cursor: "pointer",
          fontWeight: "600",
          transition: "0.2s",
          alignSelf: "flex-start",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#1DB954";
          e.currentTarget.style.color = "#FFFFFF";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#1DB954";
        }}
      >
        Back
      </button>
    </div>
  );
}
