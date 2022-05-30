import Home from "./Components/Home";
import { AppContextProvider } from "./Context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Profile from "./Components/profile";
import ChatPage from "./Components/chat";
import NewGroup from "./Components/new-group";
import GroupChat from "./Components/group-chat";
import UserChats from "./Components/user-chats";
import Login from "./Components/login-page";
import PhoneAccount from "./Components/phone-account";
import CreateAccount from "./Components/create-account";
function App() {
  return (
    <AppContextProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/phone-account" element={<PhoneAccount />} />
          <Route path="/user-chats" element={<UserChats />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/new-group" element={<NewGroup />} />
          <Route path="/group-chat" element={<GroupChat />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}

export default App;
