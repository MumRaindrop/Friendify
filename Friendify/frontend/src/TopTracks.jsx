import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigate } from "react-router-dom";

export default function TopTracks() {
  const [searchParams] = useSearchParams();
  const spotifyUserId = searchParams.get("spotifyUserId");
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spotifyUserId) return;

    fetch(
      `https://fact-eng-relying-aid.trycloudflare.com/api/spotify/me/top-tracks?spotifyUserId=${spotifyUserId}`
    )
      .then(res => res.json())
      .then(data => {
        setTracks(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [spotifyUserId]);

  if (!spotifyUserId) return <div>Missing Spotify user ID.</div>;
  if (loading) return <div>Loading top tracks...</div>;
  if (!tracks.length) return <div>No top tracks found.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Top Tracks</h1>
      <button onClick={() => navigate(-1)}>← Back</button>
      <ul style={{ padding: 0 }}>
        {tracks.map(track => (
          <li key={track.rank} style={{ listStyle: "none", marginBottom: "1rem" }}>
            <strong>{track.trackName}</strong> — {track.artistName}
          </li>
        ))}
      </ul>
    </div>
  );
}
