import { Avatar, IconButton, Input } from "@chakra-ui/react";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";

import moment from "moment";
import React, { useContext, useState, useEffect, FormEvent } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { BiArrowBack } from "react-icons/bi";
import { RiSendPlane2Fill } from "react-icons/ri";
import { useNavigate } from "react-router";
import {
  AppContext,
  chatInterface,
  eachUserInt,
  groupChatInt,
  userInterface,
} from "../Context/AuthContext";
import { auth, db } from "../firebase-config";
import GroupConfig from "./group-config";

function GroupChat() {
  const { eachUser, groupId, setEachUser } = useContext(AppContext);
  const [currChat, setCurrChat] = useState<groupChatInt | null>(null);
  const [message, setMessage] = useState<string>("");

  let navigate = useNavigate();

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

  const groupUsers = () => {
    const list = document.getElementById("group-users");
    if (currChat) {
      const sortedUsers = currChat.users.sort((a, b) => {
        if (a.uid == auth.currentUser?.uid!) return -1;
        return 0;
      });

      const breakPoint = sortedUsers.length > 3 ? ", ..." : "";
      return (
        <p id="group-users" className="whitespace-nowrap w-56">
          Você, {""}
          {sortedUsers?.slice(1, 2).map((user) => (
            <>{user.name}</>
          ))}
          {breakPoint}
        </p>
      );
    }
  };

  const msgPlace = (msg: chatInterface) => {
    return msg.senderuid == eachUser?.uid ? "flex-row-reverse mr-1" : "";
  };

  const msgShape = (msg: chatInterface) => {
    return msg.senderuid == eachUser?.uid
      ? "rounded-tl-3xl rounded-br-3xl px-3"
      : "rounded-tr-3xl rounded-bl-3xl px-3";
  };

  const otherMsg = (msg: chatInterface) => {};

  return (
    <div
      className="h-screen"
      style={{ background: `url(${eachUser?.chatBg})` }}
    >
      <div className="py-1 flex align-center justify-between bg-water-700">
        <div className="flex">
          <IconButton
            className="mt-1"
            aria-label="Voltar"
            icon={<BiArrowBack size={20} color="white" />}
            bg="none"
            onClick={() => navigate("/user-chats")}
          />
          <Avatar src={currChat?.groupIcon} />
          <div className="pl-4 flex flex-col">
            <p className="text-lg mt-1 font-sans font-semibold text-stone-100">
              {currChat?.title}
            </p>
            <div className="flex text-sm font-sans font-normal text-stone-500">
              {groupUsers()}
            </div>
          </div>
        </div>
        <div onClick={() => navigate("/group-config")} className="float-right">
          <GroupConfig />
        </div>
      </div>
      {currChat && (
        <>
          <div>
            {currChat.messages.length > 0 && (
              <>
                {currChat.messages.map((msg) => (
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
                ))}
              </>
            )}
          </div>
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
          </div>
        </>
      )}
    </div>
  );
}

export default GroupChat;
