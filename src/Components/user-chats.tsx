import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, IconButton, useDisclosure } from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineUserAdd } from "react-icons/ai";
import GroupModal from "../Styled-components/new-group-modal";

function UserChats() {
  const { eachUser, setEachUser, setUsers, setPartner, setGroupId } =
    useContext(AppContext);
  const [chatList, setChatList] = useState<any[]>([]);

  let navigate = useNavigate();

  const getUsers = async () => {
    const docRef = doc(db, "allUsers", "list");
    const docSnap: DocumentData = await getDoc(docRef);
    setUsers(docSnap.data().users);
  };

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
        setEachUser(docSnap.data());
      }
    });
  }, [onAuthStateChanged]);

  useEffect(() => {
    document.body.style.backgroundColor = "#F0EFEB";
    getUsers();
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
    navigate("/group-chat");
  };

  const startChat = (index: number) => {
    setPartner(chatList[index].users[1].uid);
    navigate("/chat");
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
    <div className="h-screen overflow-scroll">
      <div className="fixed bottom-16 right-4">
        <GroupModal />
      </div>
      <div className="inline-block">
        <h1 className="p-2 text-md text-stone-100 rounded-br-lg font-sans font-bold bg-skyblue">
          Conversas
        </h1>
      </div>

      {eachUser ? (
        <>
          {eachUser?.friends.length > 0 ? (
            <div className="w-[98%] m-auto">
              {chatList.map((chat, index) => (
                <div>
                  {chat.title ? (
                    <>
                      <div
                        className="flex align-center mt-4 p-1 shadow-lg bg-[#FDFDFC] rounded-full rounded-l-full border-b border-l border-skyblue"
                        onClick={() => groupTalk(index)}
                      >
                        <div>
                          <Avatar src={chat.groupIcon} />
                        </div>
                        <div className="ml-2">
                          <p className="text-lg font-sans font-semibold ">
                            {chat.title}
                          </p>
                          <p className="text-sm text-stone-400">
                            {lastMsg(chat)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className=" flex align-center mt-4 p-1 shadow-lg bg-[#FDFDFC] rounded-full border-b border-l border-skyblue"
                        onClick={() => startChat(index)}
                      >
                        <div>
                          <Avatar src={chat.users[1].avatar} />
                        </div>
                        <div className="ml-2">
                          <p className="text-lg font-sans font-semibold">
                            {chat.users[1].name}
                          </p>
                          <p className="text-sm text-stone-400">
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
            <div className="text-center">
              <h1 className="font-sans p-2 text-2xl font-medium text-center mt-5">
                Parece que você ainda não tem nenhum amigo.
              </h1>
              <Button
                className="m-auto mt-8 w-5/6"
                leftIcon={<AiOutlineUserAdd size={25} />}
                colorScheme="messenger"
                onClick={() => {
                  navigate("/add-friend");
                }}
              >
                Adicionar amigo
              </Button>
            </div>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default UserChats;
