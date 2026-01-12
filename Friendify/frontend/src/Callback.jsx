import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSpotify } from "./SpotifyContext";

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSpotifyUserId } = useSpotify();

  useEffect(() => {
    const spotifyUserId = searchParams.get("spotifyUserId");
    if (spotifyUserId) {
      localStorage.setItem("spotify_user_id", spotifyUserId);
      setSpotifyUserId(spotifyUserId); // update context
      navigate("/top-tracks");
    } else {
      console.error("Spotify user ID not found in callback URL.");
    }
  }, [searchParams, navigate, setSpotifyUserId]);

  return <div>Logging in and fetching your top tracks...</div>;
}
