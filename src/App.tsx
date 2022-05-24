import Home from "./Components/Home";
import { AppContextProvider } from "./Context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Profile from "./Components/profile";
function App() {
  return (
    <AppContextProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}

export default App;
