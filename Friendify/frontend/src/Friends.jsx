import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Friends(props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const spotifyUserId = props.spotifyUserId || searchParams.get("spotifyUserId");

  // -------------------------
  // Fetch Friends
  // -------------------------
  const fetchFriends = async () => {
    try {
      const res = await axios.get(`http://localhost:5139/api/friends`, {
        params: { spotifyUserId },
      });

      setFriends(res.data);
    } catch (err) {
      console.error("Error fetching friends", err);
    }
  };

  // -------------------------
  // Fetch Incoming Requests
  // -------------------------
  const fetchRequests = async () => {
    if (!spotifyUserId) return;

    try {
      const res = await axios.get(`http://localhost:5139/api/friends/requests`, {
        params: { spotifyUserId },
      });

      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching friend requests", err);
    }
  };

  // -------------------------
  // Search Users
  // -------------------------
  const searchUsers = async (query) => {
    try {
      const res = await axios.get(`http://localhost:5139/api/friends/search`, {
        params: { displayName: query },
      });

      setSearchResults(res.data);
    } catch (err) {
      console.error("Error searching users", err);
    }
  };

  // -------------------------
  // Send Friend Request
  // -------------------------
  const sendRequest = async (receiverId) => {
    if (!spotifyUserId) return;

    try {
      await axios.post(`http://localhost:5139/api/friends/request`, null, {
        params: {
          SenderSpotifyId: spotifyUserId,
          ReceiverSpotifyId: receiverId,
        },
      });

      fetchRequests();
    } catch (err) {
      console.error("Error sending friend request", err);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await axios.post(`http://localhost:5139/api/friends/accept`, null, {
        params: { requestId },
      });

      fetchRequests();
      fetchFriends();
    } catch (err) {
      console.error("Error accepting request", err);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await axios.post(`http://localhost:5139/api/friends/reject`, null, {
        params: { requestId },
      });

      fetchRequests();
    } catch (err) {
      console.error("Error rejecting request", err);
    }
  };

  const removeFriend = async (friendSpotifyId) => {
  if (!spotifyUserId) return;

    try {
      await axios.delete(`http://localhost:5139/api/friends/remove`, {
        params: {
          spotifyUserId,
          friendSpotifyId,
        },
      });

      // Refresh friends list after removal
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Friends</h1>

      {/* Go Back */}
      <button onClick={() => navigate(-1)}>← Back</button>

      {/* Search Users */}
      <section>
        <h2>Search Users</h2>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Enter Spotify display name"
        />
        <button onClick={() => searchUsers(searchQuery)}>Search</button>

        <ul>
          {searchResults.map(user => (
            <li key={user.spotifyUserId}>
              {user.displayName}
              <button onClick={() => sendRequest(user.spotifyUserId)}>
                Send Request
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Incoming Requests */}
      <section>
        <h2>Incoming Friend Requests</h2>
        {requests.length === 0 ? (
          <p>No incoming requests</p>
        ) : (
          <ul>
            {requests.map(req => (
              <li key={req.id}>
                <strong>{req.senderDisplayName}</strong>
                <button onClick={() => acceptRequest(req.id)}>Accept</button>
                <button onClick={() => rejectRequest(req.id)}>Reject</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Friends List */}
      <section>
        <h2>Your Friends</h2>
        {friends.length === 0 ? (
          <p>You have no friends yet.</p>
        ) : (
          <ul>
            {friends.map(friend => (
              <li
                key={friend.spotifyId}
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                {/* Friend name → Top Tracks */}
                <button
                  onClick={() =>
                    navigate(`/top-tracks?spotifyUserId=${friend.spotifyId}`)
                  }
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#1db954",
                    textDecoration: "underline",
                    fontSize: "1rem"
                  }}
                >
                  {friend.displayName}
                </button>

                {/* Remove Friend */}
                <button
                  onClick={() => removeFriend(friend.spotifyId)}
                  style={{
                    background: "transparent",
                    border: "1px solid red",
                    color: "red",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
