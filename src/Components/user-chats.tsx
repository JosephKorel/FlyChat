import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineUserAdd } from "react-icons/ai";

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
    document.body.style.backgroundColor = "#fffff5";
    getUsers();
  }, []);

  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

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
    getChats();
  }, []);

  const groupTalk = (index: number) => {
    setGroupId(chatList[index].id);
  };

  const startChat = (index: number) => {
    setPartner(chatList[index].users[1].uid);
  };

  return (
    <div className="h-screen">
      {eachUser ? (
        <>
          {eachUser?.friends.length > 0 ? (
            <div>
              {chatList.map((chat, index) => (
                <div>
                  <ul>
                    {chat.users.length > 2 ? (
                      <li>
                        <img src={chat.groupIcon}></img>
                        {chat.title}
                        <Link to="/group-chat" onClick={() => groupTalk(index)}>
                          Conversar
                        </Link>
                      </li>
                    ) : (
                      <li>
                        <img src={chat.users[1].avatar}></img>
                        {chat.users[1].name}
                        <Link to="/chat" onClick={() => startChat(index)}>
                          Conversar
                        </Link>
                      </li>
                    )}
                  </ul>
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

{
  /*  <div className="flex flex-col w-[100px]">
        <div className="flex justify-between">
          <div className="w-10 h-10 bg-sky-400"></div>
          <div className="w-10 h-10 bg-sky-400"></div>
        </div>
        <div className="w-full h-10 bg-sky-400 mt-2"></div>
      </div> */
}
