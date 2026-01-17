import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import logo from "./assets/Logo.png";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5139";

export default function Friends(props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const spotifyUserId =
    props.spotifyUserId || searchParams.get("spotifyUserId") || localStorage.getItem("spotify_user_id");

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const fetchFriends = async () => {
    if (!spotifyUserId) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/friends`, { params: { spotifyUserId } });
      setFriends(res.data || []);
    } catch (err) {
      console.error("Error fetching friends", err);
    }
  };

  const fetchRequests = async () => {
    if (!spotifyUserId) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/friends/requests`, { params: { spotifyUserId } });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching friend requests", err);
    }
  };

  const searchUsers = async (query) => {
    if (!query) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/friends/search`, { params: { displayName: query } });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("Error searching users", err);
    }
  };

  const sendRequest = async (receiverId) => {
    if (!spotifyUserId) return;
    try {
      await axios.post(`${BACKEND_URL}/api/friends/request`, null, {
        params: { SenderSpotifyId: spotifyUserId, ReceiverSpotifyId: receiverId },
      });
      fetchRequests();
    } catch (err) {
      console.error("Error sending friend request", err);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/friends/accept`, null, { params: { requestId } });
      fetchRequests();
      fetchFriends();
    } catch (err) {
      console.error("Error accepting request", err);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/friends/reject`, null, { params: { requestId } });
      fetchRequests();
    } catch (err) {
      console.error("Error rejecting request", err);
    }
  };

  const removeFriend = async (friendSpotifyId) => {
    if (!spotifyUserId) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/friends/remove`, { params: { spotifyUserId, friendSpotifyId } });
      fetchFriends();
    } catch (err) {
      console.error("Error removing friend", err);
    }
  };

  useEffect(() => {
    if (!spotifyUserId) return;
    fetchFriends();
    fetchRequests();
  }, [spotifyUserId]);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#121212";
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "6rem 2rem 6rem 2rem",
        backgroundColor: "#121212",
        color: "#FFFFFF",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        border: "10px solid #1DB954",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Logo/Header */}
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
        <img src={logo} alt="Friendify Logo" style={{ width: "40px", height: "40px", borderRadius: "12px", marginRight: "10px" }} />
        <span style={{ fontSize: "1.8rem", fontWeight: "700", color: "#1DB954" }}>Friendify</span>
      </div>

      {/* Search Users */}
      <section style={{ marginBottom: "2rem", width: "100%", maxWidth: "600px" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Search Users</h3>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Spotify display name"
            style={{
              flex: 1,
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid #555",
              backgroundColor: "#1e1e1e",
              color: "#FFFFFF",
            }}
          />
          <button
            onClick={() => searchUsers(searchQuery)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "50px",
              border: "2px solid #1DB954",
              backgroundColor: "transparent",
              color: "#1DB954",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1DB954"; e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1DB954"; }}
          >
            Search
          </button>
        </div>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {searchResults.map(user => (
            <li key={user.spotifyUserId} style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{user.displayName}</span>
              <button
                onClick={() => sendRequest(user.spotifyUserId)}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "50px",
                  border: "2px solid #1DB954",
                  backgroundColor: "transparent",
                  color: "#1DB954",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1DB954"; e.currentTarget.style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1DB954"; }}
              >
                Send Request
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Friend Requests */}
      <section style={{ marginBottom: "2rem", width: "100%", maxWidth: "600px" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Incoming Friend Requests</h3>
        {requests.length === 0 ? (
          <p>No incoming requests</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {requests.map(req => (
              <li key={req.id} style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{req.senderDisplayName}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => acceptRequest(req.id)}
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "50px",
                      border: "2px solid #1DB954",
                      backgroundColor: "transparent",
                      color: "#1DB954",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1DB954"; e.currentTarget.style.color = "#FFFFFF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1DB954"; }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "50px",
                      border: "2px solid red",
                      backgroundColor: "transparent",
                      color: "red",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "red"; e.currentTarget.style.color = "#FFFFFF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "red"; }}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Friends List */}
      <section style={{ marginBottom: "4rem", width: "100%", maxWidth: "600px" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Your Friends</h3>
        {friends.length === 0 ? (
          <p>You have no friends yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {friends.map(friend => (
              <li key={friend.spotifyId} style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => navigate(`/top-tracks?spotifyUserId=${friend.spotifyId}`)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1DB954",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {friend.displayName}
                </button>
                <button
                  onClick={() => removeFriend(friend.spotifyId)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "50px",
                    border: "2px solid red",
                    backgroundColor: "transparent",
                    color: "red",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "red"; e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "red"; }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
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
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1DB954"; e.currentTarget.style.color = "#FFFFFF"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1DB954"; }}
      >
        Back
      </button>
    </div>
  );
}
