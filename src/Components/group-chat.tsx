import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import moment from "moment";
import React, { useContext, useState, useEffect, FormEvent } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
  AppContext,
  eachUserInt,
  groupChatInt,
  userInterface,
} from "../Context/AuthContext";
import { auth, db } from "../firebase-config";

function GroupChat() {
  const { eachUser, groupId, setEachUser } = useContext(AppContext);
  const [currChat, setCurrChat] = useState<groupChatInt | null>(null);
  const [message, setMessage] = useState<string>("");

  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  const retrieveDoc = async () => {
    const userDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const data: DocumentData = await getDoc(userDoc);
    setEachUser(data.data());

    const chat = data
      .data()
      .groupChat.filter((item: groupChatInt) => item.id == groupId);
    setCurrChat(chat?.[0]);
  };

  const getCurrChat = () => {
    const chat: groupChatInt[] | undefined = eachUser?.groupChat.filter(
      (item) => item.id == groupId
    );
    setCurrChat(chat?.[0]!);
  };

  useEffect(() => {
    retrieveDoc();
    getCurrChat();
  }, [eachUserDoc]);

  useEffect(() => {
    getCurrChat();
  }, []);

  const sendMsg = async () => {
    const minutes = String(new Date().getMinutes()).padStart(2, "0");
    const time = new Date().getHours() + ":" + minutes;

    if (message == "") return;

    currChat?.users.forEach(async (user) => {
      const docRef = doc(db, "eachUser", `${user.uid}`);
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data();
      const chats: groupChatInt[] = docData?.groupChat;

      chats.forEach((item) => {
        if (item.id == groupId) {
          item.messages.push({
            sender: auth.currentUser?.displayName!,
            senderuid: auth.currentUser?.uid!,
            content: message,
            time,
          });
          item.at = moment().format();
        }
      });
      await updateDoc(docRef, { groupChat: chats });
    });

    setMessage("");
  };

  return (
    <div>
      {currChat && (
        <>
          <div>
            <img src={currChat.groupIcon} alt="ícone"></img>
            <button>Alterar ícone</button>
            <h1>{currChat.title}</h1>
            <h2>Usuários:</h2>
            {currChat.users.map((item) => (
              <>
                <ul>
                  <li>
                    <img src={item.avatar} alt="avatar"></img>
                    {item.name}
                  </li>
                </ul>
              </>
            ))}
          </div>
          <div>
            {currChat.messages.length > 0 && (
              <>
                <h2>Mensagens:</h2>
                {currChat.messages.map((msg) => (
                  <ul>
                    <li>
                      <img></img>
                      <strong>{msg.sender}:</strong>
                      {msg.content} at:{msg.time}
                    </li>
                  </ul>
                ))}
              </>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Digite sua mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></input>
            <button onClick={sendMsg}>Enviar</button>
          </div>
        </>
      )}
    </div>
  );
}

export default GroupChat;
