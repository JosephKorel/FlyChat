import { AppContext } from "./Context/AuthContext";
import { Routes, Route, useNavigate } from "react-router-dom";
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
import { useContext, useEffect } from "react";
import FriendList from "./Components/friends";
import AddFriend from "./Components/add-friend";
import GroupConfig from "./Components/group-config";
import WebPage from "./Components/web-page";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";

function App() {
  const { isAuth, setIsAuth, isMobile, setIsMobile } = useContext(AppContext);
  let navigate = useNavigate();

  useEffect(() => {
    window.innerWidth < 1024 ? setIsMobile(true) : setIsMobile(false);
    navigate("/");
  }, [isMobile]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuth(true);
      } else setIsAuth(false);
    });
  }, [onAuthStateChanged]);

  return (
    <ChakraProvider>
      {isAuth && isMobile && <Navbar />}
      <Routes>
        {isMobile ? (
          <>
            {isAuth ? (
              <>
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<UserChats />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/new-group" element={<NewGroup />} />
                <Route path="/group-chat" element={<GroupChat />} />
                <Route path="/group-config" element={<GroupConfig />} />
                <Route path="/friends" element={<FriendList />} />
                <Route path="/add-friend" element={<AddFriend />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Login />} />
                <Route path="/create-account" element={<CreateAccount />} />
                <Route path="/phone-account" element={<PhoneAccount />} />
              </>
            )}
          </>
        ) : (
          <>
            <Route path="/" element={<WebPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/phone-account" element={<PhoneAccount />} />
          </>
        )}
      </Routes>
      {isAuth && isMobile && <BottomNav />}
    </ChakraProvider>
  );
}

export default App;
