import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginButton from "./LoginButton";
import Callback from "./Callback";
import Home from "./Home";
import TopTracks from "./TopTracks";
import Friends from "./Friends";
import HelpInfo from "./HelpInfo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginButton />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/home" element={<Home />} />
        <Route path="/top-tracks" element={<TopTracks />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/help" element={<HelpInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
