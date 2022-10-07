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
  const { eachUser, setEachUser, partner, isMobile } = useContext(AppContext);
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

    if (!message) return;

    myChats.forEach((chat) => {
      if (chat.users[1].uid == partner) {
        chat.messages.push({
          sender: currentUser!.displayName!,
          senderuid: currentUser!.uid,
          content: message,
          time,
        });
        /*   chat.at = moment().format(); */
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
        /*   chat.at = moment().format(); */
      }
    });
    await updateDoc(friendDoc, { chats: friendChats });

    setMessage("");
  };

  const msgPlace = (msg: chatInterface) => {
    return msg.senderuid == eachUser?.uid ? "flex-row-reverse" : "";
  };

  const msgShape = (msg: chatInterface) => {
    return msg.senderuid == eachUser?.uid
      ? "rounded-tl-3xl rounded-br-3xl px-3 bg-gray-200 text-stone-900"
      : "rounded-tr-3xl rounded-bl-3xl px-3 bg-dark text-gray-100";
  };

  const myMsg = (msg: chatInterface) => {
    if (msg.senderuid == eachUser?.uid) {
      return true;
    }
  };

  return (
    <>
      <div
        className={`h-[100vh] flex flex-col overflow-hidden lg:h-screen w-full svgbackground font-sans pb-2`}
      >
        <div className="w-full py-2 flex items-center gap-4 uppercase bg-dark px-1">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button onClick={() => navigate("/")} className="text-gray-100">
                <BiArrowBack />
              </button>
            )}
            <Avatar src={currFriend?.avatar} size="sm" />
          </div>
          <p className="text-lg font-semibold text-gray-100">
            {currFriend?.name}
          </p>
        </div>
        <div className="flex-1 max-h-[96vh] overflow-y-auto pb-1">
          <div className="h-full overflow-y-auto">
            {currChat !== null && (
              <>
                {currChat?.messages.map((msg, index) => (
                  <div
                    className={`flex ${msgPlace(msg)} mt-2 px-1`}
                    key={index}
                  >
                    <div
                      className={`flex flex-col max-w-[70%] ${msgShape(msg)}`}
                    >
                      <p className={`text-sm font-sans pt-1`}>{msg.content}</p>
                      <p
                        className={`text-xs ${
                          myMsg(msg)
                            ? "text-gray-500"
                            : "text-stone-700 flex flex-row-reverse"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
            {/* <div className="h-20 w-full bg-deepblue"></div>
            <div className="h-20 w-full bg-deepblue"></div>
            <div className="h-20 w-full bg-deepblue"></div>
            <div className="h-20 w-full bg-deepblue"></div>
            <div className="h-40 w-full bg-paleyellow"></div>
            <div className="h-40 w-full bg-paleyellow"></div>
            <div className="h-40 w-full bg-paleyellow"></div>
            <div className="h-40 w-full bg-paleyellow"></div>
            <div className="h-40 w-full bg-deepblue"></div>
            <div className="h-40 w-full bg-deepblue"></div> */}
          </div>
        </div>
        <div className="w-11/12 m-auto flex justify-center items-center gap-2 lg:relative lg:top-0 xl:top-2">
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              sendMsg();
            }}
          >
            <input
              className="rounded-md w-full py-1 px-3 outline-none bg-dark text-gray-100 border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
              type="text"
              placeholder="Digite sua mensagem"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
            />
          </form>
          <button
            onClick={sendMsg}
            className="text-lg text-lime bg-dark rounded-lg p-2"
          >
            <RiSendPlane2Fill />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatPage;
