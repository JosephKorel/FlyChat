import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineUserAdd } from "react-icons/ai";
import GroupChat from "./group-chat";
import ChatPage from "./chat";
import Modal from "../Styled-components/modal";
import NewGroup from "./new-group";
import { HiUserGroup } from "react-icons/hi";

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
  const [show, setShow] = useState(false);

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
    <div className="overflow-auto bg-dark h-screen font-sans">
      {show && <Modal children={<NewGroup />} setShow={setShow} />}
      {eachUser?.friends.length ? (
        <div
          className={`fixed z-10  ${
            isMobile ? "right-4 bottom-16" : "left-0 bottom-1/4"
          }`}
        >
          <button
            className="p-1 bg-lime text-dark rounded-md text-2xl"
            onClick={() => setShow(true)}
          >
            <HiUserGroup />
          </button>
        </div>
      ) : (
        <></>
      )}
      {eachUser ? (
        <>
          {eachUser?.friends.length > 0 ? (
            <div className="w-full px-4 sm:w-2/3 lg:w-[98%] m-auto py-1 h-[75vh] lg:h-[85vh]">
              {chatList.map((chat, index) => (
                <div key={index}>
                  {chat.title ? (
                    <>
                      <div
                        className="flex items-center mt-4 p-1 shadow-lg bg-stone-200 rounded-xl border-x-2 border-stone-800 cursor-pointer "
                        onClick={() => groupTalk(index)}
                      >
                        <div>
                          <Avatar src={chat.groupIcon} />
                        </div>
                        <div className="ml-2 flex flex-col">
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
                        className="flex items-start gap-2 mt-4 py-1 px-2 rounded-xl bg-dark-600 cursor-pointer text-gray-100"
                        onClick={() => startChat(index)}
                      >
                        <img
                          src={chat.users[1].avatar}
                          referrerPolicy="no-referrer"
                          className="w-8 rounded-full"
                        ></img>

                        <div className="flex flex-col">
                          <p className="font-semibold uppercase">
                            {chat.users[1].name}
                          </p>
                          <p className="text-sm text-stone-500 -translate-y-1">
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
                  <h1 className="p-2 text-2xl font-medium text-center mt-5 text-stone-100">
                    Parece que você ainda não tem nenhum amigo.
                  </h1>
                  <button
                    className="m-auto mt-8 w-5/6 p-2 rounded-md flex justify-center items-center gap-2 bg-lime text-dark"
                    onClick={() => navigate("/add-friend")}
                  >
                    <AiOutlineUserAdd className="text-xl" />
                    <p className="font-semibold">ADICIONAR AMIGO</p>
                  </button>
                </div>
              )}
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
