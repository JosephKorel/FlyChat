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

interface chat {
  users: userInterface[];
  messages: chatInterface[];
  id: number;
}

function ChatPage() {
  const { eachUser, setEachUser, partner } = useContext(AppContext);
  const [message, setMessage] = useState<string>("");
  const [currFriend, setCurrFriend] = useState<userInterface | null>(null);
  const [currChat, setCurrChat] = useState<chat | null>(null);

  /*  const currentChat: chat[] | undefined = eachUser?.chats.filter((item) =>
    item.users.filter((obj) => obj.uid === partner)
  ); */

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

    const currentChat: chat[] | undefined = data
      .data()
      .chats.filter((item: chat) =>
        item.users.filter((obj) => obj.uid === partner)
      );

    docData.chats.forEach((item: chat, index: number) => {
      item.users.forEach((user) => {
        if (user.uid == partner) {
          setCurrChat(item);
        }
      });
    });

    console.log(currChat);

    const arr = [
      { name: [{ letter: "A" }, { letter: "B" }] },
      { name: [{ letter: "C" }, { letter: "D" }] },
      { name: [{ letter: "E" }, { letter: "F" }] },
      { name: [{ letter: "G" }, { letter: "H" }] },
    ];

    /*  console.log(
      arr.findIndex((item) => item.name.filter((obj) => obj.letter == "H"))
    ); */
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

    if (message == "") return;

    currChat?.users.forEach(async (user) => {
      const myDocRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
      const friendDoc = doc(db, "eachUser", `${partner}`);
      const getUserDoc: DocumentData = await getDoc(myDocRef);
      const userDocData: eachUserInt = getUserDoc.data();
      const myChats: chat[] = userDocData.chats;
      const getFrdDoc: DocumentData = await getDoc(friendDoc);
      const frdDocData: eachUserInt = getFrdDoc.data();
      const friendChats: chat[] = frdDocData.chats;

      myChats.forEach(async (chat) => {
        if (chat.users[1].uid == partner) {
          chat.messages.push({
            sender: currentUser?.displayName!,
            avatar: currentUser?.photoURL!,
            senderuid: currentUser?.uid!,
            content: message,
            time,
          });
        }
        await updateDoc(myDocRef, { chats: myChats });
      });

      friendChats.forEach(async (chat) => {
        if (chat.users[1].uid == auth.currentUser?.uid) {
          chat.messages.push({
            sender: currentUser?.displayName!,
            avatar: currentUser?.photoURL!,
            senderuid: currentUser?.uid!,
            content: message,
            time,
          });
        }
        await updateDoc(friendDoc, { chats: friendChats });
      });
    });

    /*  const newChat = eachUser?.chats.slice();
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
    }); */

    setMessage("");
  };

  return (
    <div>
      <div>
        <h1>Conversando com {currFriend?.name}</h1>
        {currChat !== null && (
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
