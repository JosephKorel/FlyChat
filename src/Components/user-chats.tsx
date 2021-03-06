import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Avatar, Button } from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineUserAdd } from "react-icons/ai";
import GroupModal from "../Styled-components/new-group-modal";
import GroupChat from "./group-chat";
import ChatPage from "./chat";
import AddFriend from "./add-friend";

function UserChats() {
  const {
    eachUser,
    setEachUser,
    setPartner,
    setGroupId,
    isMobile,
    setUsers,
    setChatPage,
  } = useContext(AppContext);
  const [chatList, setChatList] = useState<any[]>([]);

  let navigate = useNavigate();

  const getChats = () => {
    let chatArr: any[] = [];
    if (eachUser) {
      eachUser.groupChat.forEach((chat) => chatArr.push(chat));
      eachUser.chats.forEach((chat) => chatArr.push(chat));
    }
    const sortedChat = chatArr.sort(
      (a, b) => moment(b.at).valueOf() - moment(a.at).valueOf()
    );

    setChatList(sortedChat);
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "eachUser", user.uid);
        const docSnap: DocumentData = await getDoc(docRef);
        const usersDoc = doc(db, "allUsers", "list");
        const usersDocSnap: DocumentData = await getDoc(usersDoc);
        setUsers(usersDocSnap.data().users);
        setEachUser(docSnap.data());
      }
    });
  }, [onAuthStateChanged]);

  useEffect(() => {
    document.body.style.background = "url(./Meteor.svg)";
    getChats();
  }, []);

  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  useEffect(() => {
    getChats();
  }, [eachUserDoc]);

  const groupTalk = (index: number) => {
    setGroupId(chatList[index].id);
    isMobile
      ? navigate("/group-chat")
      : setChatPage({ page: <GroupChat />, title: "group-chat" });
  };

  const startChat = (index: number) => {
    setPartner(chatList[index].users[1].uid);
    isMobile
      ? navigate("/chat")
      : setChatPage({ page: <ChatPage />, title: "chat" });
  };

  const lastMsg = (chat: any) => {
    if (chat.messages.length !== 0) {
      return chat.messages.slice(-1)[0].content.length > 40
        ? chat.messages.slice(-1)[0].content.slice(0, 40) + "..."
        : chat.messages.slice(-1)[0].content;
    } else {
      return "";
    }
  };

  return (
    <div className="overflow-auto">
      {eachUser && (
        <>
          {eachUser.friends.length > 0 && (
            <div
              className={`fixed z-10  ${
                isMobile ? "right-4 bottom-16" : "left-0 bottom-1/4"
              }`}
            >
              <GroupModal />
            </div>
          )}
        </>
      )}
      {eachUser ? (
        <>
          {eachUser?.friends.length > 0 ? (
            <div className="w-[98%] sm:w-2/3 lg:w-[98%] m-auto py-1 h-[75vh] lg:h-[85vh]">
              {chatList.map((chat, index) => (
                <div>
                  {chat.title ? (
                    <>
                      <div
                        className="flex align-center mt-4 p-1 shadow-lg bg-stone-200 rounded-xl border-x-2 border-stone-800 cursor-pointer "
                        onClick={() => groupTalk(index)}
                      >
                        <div>
                          <Avatar src={chat.groupIcon} />
                        </div>
                        <div className="ml-2">
                          <p className="text-lg font-sans font-semibold ">
                            {chat.title}
                          </p>
                          <p className="text-sm text-stone-500">
                            {lastMsg(chat)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="flex align-center mt-4 p-1 shadow-lg bg-stone-200 rounded-xl border-x-2 border-stone-800 cursor-pointer text-stone-900"
                        onClick={() => startChat(index)}
                      >
                        <div>
                          <Avatar src={chat.users[1].avatar} />
                        </div>
                        <div className="ml-2">
                          <p className="text-lg font-sans font-semibold">
                            {chat.users[1].name}
                          </p>
                          <p className="text-sm text-stone-500">
                            {lastMsg(chat)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              {isMobile && (
                <div className="text-center">
                  <h1 className="font-sans p-2 text-2xl font-medium text-center mt-5 text-stone-100">
                    Parece que voc?? ainda n??o tem nenhum amigo.
                  </h1>
                  <Button
                    className="m-auto mt-8 w-5/6"
                    leftIcon={<AiOutlineUserAdd size={25} />}
                    colorScheme="messenger"
                    onClick={() => navigate("/add-friend")}
                  >
                    Adicionar amigo
                  </Button>
                </div>
              )}{" "}
            </>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default UserChats;

/* className="flex align-center mt-4 p-1 shadow-lg bg-[#FDFDFC] rounded-full rounded-l-full border-b border-l border-skyblue cursor-pointer" */
