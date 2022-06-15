import React, {
  useContext,
  useState,
  useEffect,
  MouseEventHandler,
  MouseEvent,
} from "react";
import { AppContext } from "../Context/AuthContext";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import moment from "moment";
import { onAuthStateChanged } from "firebase/auth";
import UserChats from "./user-chats";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Avatar, IconButton } from "@chakra-ui/react";
import ChatPage from "./chat";
import GroupChat from "./group-chat";
import { FaUserFriends } from "react-icons/fa";
import { AiFillWechat, AiOutlineArrowRight } from "react-icons/ai";
import { IoMdPersonAdd } from "react-icons/io";
import FriendList from "./friends";
import AddFriend from "./add-friend";
import Profile from "./profile";
import { useNavigate } from "react-router";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";

interface Page {
  component: React.ReactNode;
  title: string;
}

function WebPage() {
  const [page, setPage] = useState<Page | null>(null);
  const {
    isAuth,
    setGroupId,
    setPartner,
    setEachUser,
    eachUser,
    setChatPage,
    chatPage,
  } = useContext(AppContext);
  const [chatList, setChatList] = useState<any[] | undefined>(undefined);
  const [showNav, setShowNav] = useState<boolean>(false);
  let navigate = useNavigate();

  useEffect(() => {
    document.body.style.background = "#F0EFEB";
    document.body.style.overflow = "hidden";
  }, []);

  const getChats = () => {
    let chatArr: any[] = [];
    if (eachUser) {
      eachUser.groupChat.forEach((chat) => chatArr.push(chat));
      eachUser.chats.forEach((chat) => chatArr.push(chat));
    }
    const sortedChat = chatArr.sort(
      (a, b) => moment(b.at).valueOf() - moment(a.at).valueOf()
    );
    if (sortedChat.length > 0) {
      if (sortedChat[0].title) {
        setGroupId(sortedChat[0].id);
        setChatPage({ page: <GroupChat />, title: "group-chat" });
      } else {
        setPartner(sortedChat[0].users[1].uid);
        setChatPage({ page: <ChatPage />, title: "chat" });
      }
    }

    setChatList(sortedChat);
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "eachUser", user.uid);
        const docSnap: DocumentData = await getDoc(docRef);
        setEachUser(docSnap.data());
      }
    });
  }, [onAuthStateChanged]);

  useEffect(() => {
    !isAuth && navigate("/login");
    setPage({ component: <UserChats />, title: "userChats" });
  }, []);

  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  useEffect(() => {
    getChats();
  }, [eachUserDoc]);

  const closeNavbar = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.id !== "leftnav" && setShowNav(false);
  };

  return (
    <>
      <div className="flex w-full m-auto" onClick={closeNavbar}>
        <div className="w-1/3 border-r-2 flex-grow">
          <div className="sticky top-0 w-full z-10">
            <h1 className="p-2 text-4xl font-extrabold text-stone-100 font-dancing bg-skyblue">
              <span className="text-2xl italic text-paleyellow-800 font-sans font-normal">
                Fly
              </span>
              Chat
            </h1>
          </div>
          <div className="overflow-y-auto">{page?.component}</div>
        </div>
        {chatList && (
          <>
            {chatList.length > 0 ? (
              <div
                className="w-2/3 overflow-auto"
                style={{ background: "url('./default_svg.png')" }}
              >
                <>{chatPage?.page}</>
              </div>
            ) : (
              <div className="w-2/3 h-screen bg-skyblue text-center flex flex-col align-center justify-center">
                <h1 className="text-7xl italic text-paleyellow-800 font-sans font-normal mb-2">
                  Fly
                </h1>
                <h1 className="p-2 text-9xl font-extrabold text-stone-100 font-dancing bg-skyblue">
                  Chat
                </h1>
              </div>
            )}
          </>
        )}
      </div>
      <>
        <div
          className={`${
            showNav ? "leftnav" : "hidenav"
          } flex flex-col justify-around rounded-tr-2xl rounded-br-2xl bg-water fixed left-0 top-[20%] h-2/3 z-10`}
          id="leftnav"
        >
          <div className="cursor-pointer">
            <IconButton
              aria-label="chats"
              variant="flushed"
              color={page?.title == "userChats" ? "white" : "blackAlpha.800"}
              icon={<AiFillWechat size={25} />}
              size="md"
              onClick={() => {
                setPage({ component: <UserChats />, title: "userChats" });
                setShowNav(false);
              }}
            ></IconButton>
          </div>
          <div className="cursor-pointer">
            <IconButton
              aria-label="friends"
              variant="flushed"
              color={page?.title == "friends" ? "white" : "blackAlpha.800"}
              icon={<FaUserFriends size={25} />}
              size="md"
              onClick={() => {
                setPage({ component: <FriendList />, title: "friends" });
                setShowNav(false);
              }}
            ></IconButton>
          </div>
          <div>
            <IconButton
              aria-label="friends"
              variant="flushed"
              color={page?.title == "addFriend" ? "white" : "#222427"}
              icon={<IoMdPersonAdd size={25} />}
              size="md"
              onClick={() => {
                setPage({ component: <AddFriend />, title: "addFriend" });
                setShowNav(false);
              }}
            ></IconButton>
          </div>
          <div
            onClick={() => {
              setPage({ component: <Profile />, title: "profile" });
              setShowNav(false);
            }}
            className="cursor-pointer"
          >
            <Avatar
              src={auth.currentUser?.photoURL!}
              size="sm"
              className="ml-1"
            />
          </div>
        </div>
        <div className={`fixed left-0 top-1/2`}>
          <div
            className="p-1 py-3 rounded-tr-lg rounded-br-lg bg-skyblue cursor-pointer"
            onClick={() => setShowNav(true)}
          >
            {<AiOutlineArrowRight color="white" />}
          </div>
        </div>
      </>
    </>
  );
}

export default WebPage;
