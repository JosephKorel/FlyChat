import Home from "./Components/Home";
import { AppContextProvider } from "./Context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Profile from "./Components/profile";
import ChatPage from "./Components/chat";
function App() {
  interface chatInterface {
    sender: string;
    avatar: string;
    content: string;
    time: string;
  }
  return (
    <AppContextProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}

export default App;
