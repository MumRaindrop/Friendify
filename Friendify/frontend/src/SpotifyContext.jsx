import { createContext, useContext, useState, useEffect } from "react";

const SpotifyContext = createContext();

export function SpotifyProvider({ children }) {
  const [spotifyUserId, setSpotifyUserId] = useState(null);

  // Initialize from localStorage once on mount
  useEffect(() => {
    const id = localStorage.getItem("spotify_user_id");
    if (id) setSpotifyUserId(id);
  }, []);

  return (
    <SpotifyContext.Provider value={{ spotifyUserId, setSpotifyUserId }}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  return useContext(SpotifyContext);
}
