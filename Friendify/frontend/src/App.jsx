import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginButton from "./LoginButton";
import Callback from "./Callback";
import Home from "./Home";
import TopTracks from "./TopTracks";
import Friends from "./Friends"; // <-- import the new Friends page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginButton />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/home" element={<Home />} />
        <Route path="/top-tracks" element={<TopTracks />} />
        <Route path="/friends" element={<Friends />} /> {/* <-- new route */}
      </Routes>
    </Router>
  );
}

export default App;
