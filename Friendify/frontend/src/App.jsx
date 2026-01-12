import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginButton from "./LoginButton";
import Callback from "./Callback";
import Home from "./Home";
import TopTracks from "./TopTracks";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginButton />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/home" element={<Home />} />
        <Route path="/top-tracks" element={<TopTracks />} />
      </Routes>
    </Router>
  );
}

export default App;
