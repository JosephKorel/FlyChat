import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";
import { Link } from "react-router-dom";

function UserChats() {
  const { eachUser, setPartner, setGroupId } = useContext(AppContext);
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
    const sortedChat = chatArr.sort(
      (a, b) => moment(b.at).valueOf() - moment(a.at).valueOf()
    );
    setChatList(sortedChat);
  };

  useEffect(() => {
    getChats();
  }, []);

  const groupTalk = (index: number) => {
    setGroupId(chatList[index].groupId);
  };

  const startChat = (index: number) => {
    setPartner(chatList[index].users[1].uid);
  };

  return (
    <div>
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
    </div>
  );
}

export default UserChats;
