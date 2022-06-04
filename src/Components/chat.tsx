import React, { useContext, useState, useEffect } from "react";
import {
  AppContext,
  eachUserInt,
  userInterface,
  eachChat,
  chatInterface,
} from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";
import { Avatar, IconButton, Input } from "@chakra-ui/react";
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router";
import { RiSendPlane2Fill } from "react-icons/ri";

function ChatPage() {
  const { eachUser, setEachUser, partner } = useContext(AppContext);
  const [message, setMessage] = useState<string>("");
  const [currFriend, setCurrFriend] = useState<userInterface | null>(null);
  const [currChat, setCurrChat] = useState<eachChat | null>(null);
  let navigate = useNavigate();

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

  const msgPlace = (msg: chatInterface) => {
    return msg.senderuid == eachUser?.uid ? "flex-row-reverse mr-1" : "";
  };

  const msgShape = (msg: chatInterface) => {
    return msg.senderuid == eachUser?.uid
      ? "rounded-tl-3xl rounded-br-3xl px-3"
      : "rounded-tr-3xl rounded-bl-3xl px-3";
  };

  return (
    <div
      className="h-screen"
      style={{ background: `url(${eachUser?.chatBg})` }}
    >
      <div className="py-1 flex align-center bg-water-700">
        <div>
          <IconButton
            className="mt-1"
            aria-label="Voltar"
            icon={<BiArrowBack size={20} color="white" />}
            bg="none"
            onClick={() => navigate("/user-chats")}
          />
          <Avatar src={currFriend?.avatar} />
        </div>
        <p className="text-lg mt-1 font-sans leading-10 pl-6 font-semibold text-stone-100">
          {currFriend?.name}
        </p>
      </div>
      <div>
        {currChat !== null && (
          <>
            {currChat?.messages.map((msg) => (
              <>
                <div className={`flex ${msgPlace(msg)} mt-2`}>
                  <div
                    className={`flex flex-col max-w-[70%] bg-skyblue ${msgShape(
                      msg
                    )}`}
                  >
                    <div className={``}>
                      <p className={`text-sm text-stone-100 font-sans pt-1`}>
                        {msg.content}
                      </p>
                    </div>
                    <p className={`text-xs text-stone-300`}>{msg.time}</p>
                  </div>
                </div>
              </>
            ))}
          </>
        )}
        <div className="w-full py-2 m-auto absolute bottom-0 flex align-center justify-around">
          <Input
            bg="white"
            rounded="full"
            width="80%"
            type="text"
            placeholder="Digite sua mensagem"
            value={message}
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setMessage(e.currentTarget.value)
            }
          ></Input>
          <IconButton
            aria-label="Enviar"
            icon={<RiSendPlane2Fill size={20} color="white" />}
            bg="blue.500"
            rounded="full"
            onClick={sendMsg}
          />
          {/*  <button onClick={sendMsg}>Enviar</button> */}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
