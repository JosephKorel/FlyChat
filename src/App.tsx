import Home from "./Components/Home";
import { AppContextProvider, AppContext } from "./Context/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./Components/Navbar";
import Profile from "./Components/profile";
import ChatPage from "./Components/chat";
import NewGroup from "./Components/new-group";
import GroupChat from "./Components/group-chat";
import UserChats from "./Components/user-chats";
import Login from "./Components/login-page";
import PhoneAccount from "./Components/phone-account";
import CreateAccount from "./Components/create-account";
import { ChakraProvider } from "@chakra-ui/react";
import BottomNav from "./Components/bottom-nav";
import { useContext } from "react";
import FriendList from "./Components/friends";
import AddFriend from "./Components/add-friend";
import GroupConfig from "./Components/group-config";
function App() {
  const { isAuth } = useContext(AppContext);
  return (
    <AppContextProvider>
      <ChakraProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/phone-account" element={<PhoneAccount />} />
            <Route path="/user-chats" element={<UserChats />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/new-group" element={<NewGroup />} />
            <Route path="/group-chat" element={<GroupChat />} />
            <Route path="/group-config" element={<GroupConfig />} />
            <Route path="/friends" element={<FriendList />} />
            <Route path="/add-friend" element={<AddFriend />} />
          </Routes>
          {/* {isAuth && <BottomNav />} */}
          <BottomNav />
        </Router>
      </ChakraProvider>
    </AppContextProvider>
  );
}

export default App;
