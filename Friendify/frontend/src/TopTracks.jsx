import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "./assets/logo.png";
import axios from "axios";

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

  // -------------------------
  // Fetch Display Name by Spotify ID
  // -------------------------
  useEffect(() => {
    if (!spotifyUserId) return;

    const fetchDisplayName = async () => {
      try {
        const res = await axios.get("http://localhost:5139/api/friends/user", {
          params: { spotifyUserId }
        });
        setDisplayName(res.data?.displayName || "User");
      } catch (err) {
        console.error("Error fetching display name", err);
        setDisplayName("User");
      }
    };

    fetchDisplayName();
  }, [spotifyUserId]);

  // -------------------------
  // Fetch Top Tracks
  // -------------------------
  useEffect(() => {
    if (!spotifyUserId) return;
    setLoading(true);

    fetch(
      `https://fact-eng-relying-aid.trycloudflare.com/api/spotify/me/top-tracks?spotifyUserId=${spotifyUserId}&timeRange=${timeRange}`
    )
      .then(res => res.json())
      .then(data => {
        setTracks(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [spotifyUserId, timeRange]);

  if (!spotifyUserId) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#121212",
          color: "#fff",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
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
        padding: "3rem 2rem 2rem 2rem", // top padding to avoid logo overlap
        backgroundColor: "#121212",
        color: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        border: "10px solid #1DB954",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      {/* Friendify Logo Top-Left */}
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
      <div style={{ textAlign: "center", marginBottom: "2rem", marginTop: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700" }}>
          <span style={{ color: "#1DB954" }}>{displayName}'s</span> Top Tracks
        </h1>
      </div>

      {/* Time Range Selector */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          justifyContent: "center",
          flexWrap: "wrap"
        }}
      >
        {TIME_RANGES.map(r => (
          <button
            key={r.key}
            onClick={() => setTimeRange(r.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: timeRange === r.key ? "2px solid #1DB954" : "1px solid #555",
              background: timeRange === r.key ? "#1DB954" : "transparent",
              color: timeRange === r.key ? "#fff" : "#ccc",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.2s"
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Tracks List */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "4rem" }}>
        {loading ? (
          <div style={{ textAlign: "center" }}>Loading top tracks...</div>
        ) : tracks.length === 0 ? (
          <div style={{ textAlign: "center" }}>No top tracks found.</div>
        ) : (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {tracks.map(track => (
              <li
                key={track.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                  borderBottom: "1px solid #333",
                  paddingBottom: "0.5rem"
                }}
              >
                {/* Album Image */}
                {track.albumImageUrl && (
                  <img
                    src={track.albumImageUrl}
                    alt={track.albumName}
                    style={{ width: 60, height: 60, borderRadius: "4px", objectFit: "cover" }}
                  />
                )}

                {/* Track Info */}
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "1.1rem" }}>
                    {track.rank}. {track.trackName}
                  </strong>
                  <div style={{ color: "#ccc" }}>{track.artistName}</div>
                  <div style={{ color: "#888", fontSize: "0.9rem" }}>{track.albumName}</div>
                  <div style={{ color: "#888", fontSize: "0.9rem" }}>Popularity: {track.popularity}</div>
                </div>

                {/* Preview Button */}
                {track.previewUrl && (
                  <a
                    href={track.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#1DB954",
                      color: "#fff",
                      borderRadius: "20px",
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: "0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#17a44c"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1DB954"; }}
                  >
                    Preview
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
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
          alignSelf: "flex-start"
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
        ← Back
      </button>
    </div>
  );
}
