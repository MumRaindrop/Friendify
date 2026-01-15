import { useNavigate, useSearchParams } from "react-router-dom";

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const spotifyUserId = searchParams.get("spotifyUserId");

  if (!spotifyUserId) {
    return <div>Missing Spotify user ID.</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome 🎧</h1>
      <button onClick={() => navigate(-1)}>← Back</button>
      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => navigate(`/top-tracks?spotifyUserId=${spotifyUserId}`)}
          style={{ marginRight: "1rem" }}
        >
          🎵 Top Tracks
        </button>

        <button
          onClick={() => navigate(`/friends?spotifyUserId=${spotifyUserId}`)}
        >
          👥 Friends
        </button>
      </div>
    </div>
  );
}
