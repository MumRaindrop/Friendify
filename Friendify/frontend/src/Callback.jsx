import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSpotify } from "./SpotifyContext";

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSpotifyUserId } = useSpotify();

  useEffect(() => { // Redirect to next page based on spotify id in current url
    const spotifyUserId = searchParams.get("spotifyUserId");
    if (spotifyUserId) {
      localStorage.setItem("spotify_user_id", spotifyUserId);
      setSpotifyUserId(spotifyUserId);
      navigate("/top-tracks");
    } else {
      console.error("Spotify user ID not found in callback URL.");
    }
  }, [searchParams, navigate, setSpotifyUserId]);

  return <div>Logging in and fetching your top tracks...</div>;
}
