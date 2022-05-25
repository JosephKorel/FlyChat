import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
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
  content: string;
  time: string;
}

function ChatPage() {
  const { eachUser, setEachUser, partner } = useContext(AppContext);
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<
    { users: string[]; messages: chatInterface[]; id: number }[] | undefined
  >(undefined);

  const currentChat = eachUser?.chats.filter((item) =>
    item.users.includes(partner!)
  );

  const retrieveDoc = async () => {
    const userDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const data: DocumentData = await getDoc(userDoc);
    setEachUser(data.data());
  };

  useEffect(() => {
    retrieveDoc();
  }, []);

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
  }, [eachUserDoc]);

  const sendMsg = async () => {
    const currentUser = auth.currentUser;
    const currentUserDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friendIndex = eachUser?.friends.findIndex(
      (item) => item.name == partner
    );
    const friend: userInterface | undefined = eachUser?.friends[friendIndex!];
    const friendDoc = doc(db, "eachUser", `${friend?.uid}`);
    const time = new Date().getHours() + ":" + new Date().getMinutes();
    const chatDoc: DocumentData = await getDoc(currentUserDoc);
    const chatData:
      | {
          users: string[];
          messages: chatInterface[];
          id: number;
        }[]
      | undefined = chatDoc.data().chats;
    const refIndex = chatData?.findIndex((item) =>
      item.users.includes(partner!)
    );

    const newChat = eachUser?.chats.slice();
    newChat?.[refIndex!].messages.push({
      sender: currentUser?.displayName!,
      avatar: currentUser?.photoURL!,
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
        <h1>Conversando com {partner}</h1>
        {currentChat && (
          <ul>
            {currentChat.map((item) =>
              item.messages.map((msg) => (
                <>
                  <li>
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
