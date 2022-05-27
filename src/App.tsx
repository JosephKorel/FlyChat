import Home from "./Components/Home";
import { AppContextProvider } from "./Context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Profile from "./Components/profile";
import ChatPage from "./Components/chat";
import NewGroup from "./Components/new-group";
function App() {
  return (
    <AppContextProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/new-group" element={<NewGroup />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}

export default App;
