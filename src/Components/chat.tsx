import React, { useContext, useState, useEffect } from "react";
import {
  AppContext,
  eachUserInt,
  userInterface,
  eachChat,
} from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";

function ChatPage() {
  const { eachUser, setEachUser, partner } = useContext(AppContext);
  const [message, setMessage] = useState<string>("");
  const [currFriend, setCurrFriend] = useState<userInterface | null>(null);
  const [currChat, setCurrChat] = useState<eachChat | null>(null);

  const retrieveDoc = async () => {
    const userDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const data: DocumentData = await getDoc(userDoc);
    setEachUser(data.data());
  };

  const getPartner = async () => {
    const partnerDoc = doc(db, "eachUser", `${partner}`);
    const getPtrDoc: DocumentData = await getDoc(partnerDoc);
    const docData: eachUserInt = getPtrDoc.data();
    setCurrFriend({
      name: docData.name,
      avatar: docData.avatar,
      uid: docData.uid,
    });

    await docUpdate();
  };

  useEffect(() => {
    retrieveDoc();
  }, []);

  useEffect(() => {
    getPartner();
    docUpdate();

    console.log(partner);
  }, [partner]);

  //Atualização em tempo-real
  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  const docUpdate = async () => {
    const userDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const data: DocumentData = await getDoc(userDoc);
    const docData: eachUserInt = data.data();
    setEachUser(data.data());

    docData.chats.forEach((item: eachChat, index: number) => {
      item.users.forEach((user) => {
        if (user.uid == partner) {
          setCurrChat(item);
        }
      });
    });
  };

  useEffect(() => {
    docUpdate();
    getPartner();
  }, [eachUserDoc]);

  const sendMsg = async () => {
    const currentUser = auth.currentUser;
    const myDocRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friendDoc = doc(db, "eachUser", `${partner}`);
    const getUserDoc: DocumentData = await getDoc(myDocRef);
    const userDocData: eachUserInt = getUserDoc.data();
    const myChats: eachChat[] = userDocData.chats;
    const getFrdDoc: DocumentData = await getDoc(friendDoc);
    const frdDocData: eachUserInt = getFrdDoc.data();
    const friendChats: eachChat[] = frdDocData.chats;
    const minutes = String(new Date().getMinutes()).padStart(2, "0");
    const time = new Date().getHours() + ":" + minutes;

    if (message == "") return;

    myChats.forEach((chat) => {
      if (chat.users[1].uid == partner) {
        chat.messages.push({
          sender: currentUser?.displayName!,
          senderuid: currentUser?.uid!,
          content: message,
          time,
        });
        chat.at = moment().format();
      }
    });
    await updateDoc(myDocRef, { chats: myChats });

    friendChats.forEach((chat) => {
      if (chat.users[1].uid == auth.currentUser?.uid) {
        chat.messages.push({
          sender: currentUser?.displayName!,
          senderuid: currentUser?.uid!,
          content: message,
          time,
        });
        chat.at = moment().format();
      }
    });
    await updateDoc(friendDoc, { chats: friendChats });

    setMessage("");
  };

  console.log(currChat);

  return (
    <div>
      <div>
        <h1>Conversando com {currFriend?.name}</h1>
        {currChat !== null && (
          <div
            style={{ backgroundImage: `url(${currChat.background})` }}
            className="chat-container"
          >
            <ul>
              {currChat?.messages.map((msg) => (
                <>
                  <li>
                    <img
                      src={
                        msg.sender == eachUser?.name
                          ? eachUser.avatar
                          : currFriend?.avatar
                      }
                      alt="usuário"
                    ></img>
                    <strong>{msg.sender}:</strong>
                    {msg.content} at:{msg.time}
                  </li>
                </>
              ))}
            </ul>
          </div>
        )}
        <input
          type="text"
          placeholder="Digite sua mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></input>
        <button onClick={sendMsg}>Enviar</button>
      </div>
    </div>
  );
}

export default ChatPage;
