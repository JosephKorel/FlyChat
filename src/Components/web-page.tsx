import React, { useContext, useState, useEffect } from "react";
import { AppContext, userInterface } from "../Context/AuthContext";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import moment from "moment";
import { onAuthStateChanged } from "firebase/auth";
import UserChats from "./user-chats";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Avatar, IconButton, Input } from "@chakra-ui/react";
import ChatPage from "./chat";
import GroupChat from "./group-chat";
import { FaUserFriends } from "react-icons/fa";
import { AiFillWechat } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router";
import { IoMdPersonAdd } from "react-icons/io";
import FriendList from "./friends";
import AddFriend from "./add-friend";

function WebPage() {
  const [page, setPage] = useState<React.ReactNode>(<UserChats />);
  const {
    setGroupId,
    setPartner,
    setEachUser,
    eachUser,
    setChatPage,
    chatPage,
    isMobile,
    setIsMobile,
  } = useContext(AppContext);
  const [chatList, setChatList] = useState<any[] | undefined>(undefined);

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
        setChatPage(<GroupChat />);
      } else {
        setPartner(sortedChat[0].users[1].uid);
        setChatPage(<ChatPage />);
      }
    }
    /*    sortedChat[0].title
      ? setGroupId(sortedChat[0].id)
      : setPartner(sortedChat[0].id); */

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
    setPage(() => <UserChats />);
  }, []);

  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  useEffect(() => {
    getChats();
  }, [eachUserDoc]);

  return (
    <>
      <div className="flex w-[95%] float-right">
        <div className="w-1/3">{page}</div>
        <div className="w-2/3">{chatList && <>{chatPage}</>}</div>
      </div>
      <div className="flex flex-col justify-around p3  bg-skyblue rounded-r-2xl fixed left-0 h-2/3">
        <div>
          <IconButton
            aria-label="chats"
            variant="flushed"
            color={page == <UserChats /> ? "white" : "blackAlpha.800"}
            icon={<AiFillWechat size={25} />}
            size="md"
          ></IconButton>
        </div>
        <div>
          <IconButton
            aria-label="friends"
            variant="flushed"
            color={page == <FriendList /> ? "#2a6fdb" : "blackAlpha.800"}
            icon={<FaUserFriends size={25} />}
            size="md"
          ></IconButton>
        </div>
        <div>
          <IconButton
            aria-label="friends"
            variant="flushed"
            color={page == <AddFriend /> ? "#2a6fdb" : "blackAlpha.800"}
            icon={<IoMdPersonAdd size={25} />}
            size="md"
          ></IconButton>
        </div>
        <div>
          <Avatar
            src={auth.currentUser?.photoURL!}
            size="sm"
            className="ml-1"
          />
        </div>
      </div>
    </>
  );
}

export default WebPage;
