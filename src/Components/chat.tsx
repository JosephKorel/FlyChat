import React, { useContext, useState, useEffect } from "react";
import { AppContext, eachUserInt } from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";

interface userInterface {
  name: string;
  avatar: string;
  uid: string;
}

interface chatInterface {
  sender: string;
  avatar: string;
  senderuid: string;
  content: string;
  time: string;
}

function ChatPage() {
  const { eachUser, setEachUser, partner } = useContext(AppContext);
  const [message, setMessage] = useState<string>("");
  const [currFriend, setCurrFriend] = useState<userInterface | null>(null);

  const currentChat:
    | { users: userInterface[]; messages: chatInterface[]; id: number }[]
    | undefined = eachUser?.chats.filter((item) =>
    item.users.filter((obj) => obj.uid == currFriend?.uid)
  );

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
  };

  useEffect(() => {
    retrieveDoc();
  }, []);

  useEffect(() => {
    getPartner();
  }, [partner]);

  //Atualização em tempo-real
  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  const docUpdate = async () => {
    const userDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const data: DocumentData = await getDoc(userDoc);
    setEachUser(data.data());
  };

  useEffect(() => {
    docUpdate();
    getPartner();
  }, [eachUserDoc]);

  const sendMsg = async () => {
    const currentUser = auth.currentUser;
    const currentUserDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friendIndex = eachUser?.friends.findIndex(
      (item) => item.name == currFriend?.name
    );
    const friend: userInterface | undefined = eachUser?.friends[friendIndex!];
    const friendDoc = doc(db, "eachUser", `${friend?.uid}`);
    const time = new Date().getHours() + ":" + new Date().getMinutes();
    const chatDoc: DocumentData = await getDoc(currentUserDoc);
    const chatData:
      | {
          users: userInterface[];
          messages: chatInterface[];
          id: number;
        }[]
      | undefined = chatDoc.data().chats;
    const refIndex = chatData?.findIndex((item) =>
      item.users.filter((obj: userInterface) => obj.uid == currFriend?.uid)
    );

    const newChat = eachUser?.chats.slice();
    newChat?.[refIndex!].messages.push({
      sender: currentUser?.displayName!,
      avatar: currentUser?.photoURL!,
      senderuid: currentUser?.uid!,
      content: message,
      time,
    });

    await updateDoc(currentUserDoc, {
      chats: newChat,
    });

    await updateDoc(friendDoc, {
      chats: newChat,
    });

    setMessage("");
  };

  return (
    <div>
      <div>
        <h1>Conversando com {currFriend?.name}</h1>
        {currentChat && (
          <ul>
            {currentChat.map((item) =>
              item.messages.map((msg) => (
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
              ))
            )}
          </ul>
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
