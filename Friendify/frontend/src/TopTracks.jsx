import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import logo from "./assets/Logo.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5139";

const TIME_RANGES = [
  { key: "short_term", label: "Last 4 Weeks" },
  { key: "medium_term", label: "Last 6 Months" },
  { key: "long_term", label: "All Time" }
];

export default function TopTracks() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const spotifyUserId = searchParams.get("spotifyUserId");

  const [displayName, setDisplayName] = useState("User");
  const [timeRange, setTimeRange] = useState("medium_term");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Fetch user display name
  // -----------------------------
  useEffect(() => {
    if (!spotifyUserId) return;

    const fetchDisplayName = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/friends/user`, { params: { spotifyUserId } });
        setDisplayName(res.data?.displayName || "User");
      } catch (err) {
        console.error("Failed to fetch display name", err);
        setDisplayName("User");
      }
    };

    fetchDisplayName();
  }, [spotifyUserId]);

  // -----------------------------
  // Fetch top tracks
  // -----------------------------
  useEffect(() => {
    if (!spotifyUserId) return;

    const fetchTopTracks = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/spotify/me/top-tracks`, {
          params: { spotifyUserId, timeRange }
        });
        setTracks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch top tracks", err);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, [spotifyUserId, timeRange]);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#121212";
  }, []);

  if (!spotifyUserId) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121212",
        color: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: "1.2rem",
      }}>
        Missing Spotify user ID.
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "2rem",
      backgroundColor: "#121212",
      color: "#FFFFFF",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      border: "10px solid #1DB954",
      boxSizing: "border-box",
      position: "relative",
    }}>
      {/* Header */}
      <div
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <img src={logo} alt="Friendify" style={{ width: 40, height: 40, borderRadius: 12, marginRight: 10 }} />
        <span style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1DB954" }}>Friendify</span>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginTop: "4rem", marginBottom: "2rem" }}>
        <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 400 }}>Top Tracks</h2>
        <h1 style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 700, color: "#1DB954" }}>
          {displayName || "Loading..."}
        </h1>
      </div>

      {/* Time range buttons */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        {TIME_RANGES.map(r => (
          <button
            key={r.key}
            onClick={() => setTimeRange(r.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: timeRange === r.key ? "2px solid #1DB954" : "1px solid #555",
              backgroundColor: timeRange === r.key ? "#1DB954" : "transparent",
              color: timeRange === r.key ? "#fff" : "#ccc",
              cursor: "pointer",
              fontWeight: 600,
              transition: "0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#1DB954"; e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = timeRange === r.key ? "#1DB954" : "transparent"; e.currentTarget.style.color = timeRange === r.key ? "#fff" : "#ccc"; }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Track list */}
      <div style={{ flex: 1, width: "100%", maxWidth: "600px" }}>
        {loading ? (
          <div style={{ textAlign: "center" }}>Loading top tracks...</div>
        ) : tracks.length === 0 ? (
          <div style={{ textAlign: "center" }}>No top tracks found.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tracks.map((track, index) => (
              <li key={`${track.trackName}-${index}`} style={{ display: "flex", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>
                {track.albumImageUrl && <img src={track.albumImageUrl} alt={track.albumName} style={{ width: 60, height: 60, borderRadius: 4, objectFit: "cover" }} />}
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "1.1rem" }}>{index + 1}. {track.trackName}</strong>
                  <div style={{ color: "#ccc" }}>{track.artistName}</div>
                  <div style={{ color: "#888", fontSize: "0.9rem" }}>{track.albumName}</div>
                  {track.previewUrl && (
                    <a href={track.previewUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "0.25rem 0.5rem", marginTop: "0.25rem", display: "inline-block", borderRadius: "20px", backgroundColor: "#1DB954", color: "#fff", textDecoration: "none", fontWeight: 600, transition: "0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#17a44c"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1DB954"; }}
                    >
                      Preview
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Back button */}
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
          fontWeight: 600,
          transition: "0.2s",
          alignSelf: "flex-start",
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#1DB954"; e.currentTarget.style.color = "#FFFFFF"; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1DB954"; }}
      >
        ← Back
      </button>
    </div>
  );
}
