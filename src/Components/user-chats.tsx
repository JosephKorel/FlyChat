import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";

function UserChats() {
  const { eachUser, setEachUser } = useContext(AppContext);
  const [chatList, setChatList] = useState<any[]>([]);

  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  const getChats = () => {
    let chatArr: any[] = [];
    if (eachUser) {
      eachUser.groupChat.forEach((chat) => chatArr.push(chat));
      eachUser.chats.forEach((chat) => chatArr.push(chat));
    }
    const sorted = chatArr.sort((a, b) => a.at - b.at);
    console.log(sorted);
    setChatList(sorted);
  };

  useEffect(() => {
    getChats();
  }, []);

  return (
    <div>
      <div>
        {chatList.map((chat) => (
          <div>
            <ul>
              {chat.users.length > 2 ? (
                <li>
                  <img src={chat.groupIcon}></img>
                  {chat.title}
                </li>
              ) : (
                <li>
                  <img src={chat.users[1].avatar}></img>
                  {chat.users[1].name}
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserChats;
