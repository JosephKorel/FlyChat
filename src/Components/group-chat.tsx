import { Avatar, IconButton, Input } from "@chakra-ui/react";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import moment from "moment";
import React, { useContext, useState, useEffect } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { BiArrowBack } from "react-icons/bi";
import { RiSendPlane2Fill } from "react-icons/ri";
import { useNavigate } from "react-router";
import {
  AppContext,
  chatInterface,
  groupChatInt,
  userInterface,
} from "../Context/AuthContext";
import { auth, db } from "../firebase-config";
import GroupConfig from "./group-config";

function GroupChat() {
  const { eachUser, groupId, setEachUser, isMobile, setChatPage } =
    useContext(AppContext);
  const [currChat, setCurrChat] = useState<groupChatInt | null>(null);
  const [message, setMessage] = useState<string>("");
  let navigate = useNavigate();

  useEffect(() => {
    isMobile && (document.body.style.background = 'url("./default_svg.png")');
  }, []);

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
    const groupHeader = document.getElementById("group-header");
    let slicedUsers: userInterface[] = [];
    if (currChat) {
      const sortedUsers = currChat.users.sort((a, b) => {
        if (a.uid == auth.currentUser?.uid!) return -1;
        return 0;
      });
      sortedUsers.slice(1).length >= 5 && (slicedUsers = sortedUsers.slice(1));
      return (
        <p id="group-users" className="whitespace-nowrap w-56 md:w-auto">
          Você, {""}
          {isMobile ? (
            <>
              {" "}
              {list && groupHeader && (
                <>
                  {" "}
                  {groupHeader.offsetWidth - list.offsetWidth < 40 ? (
                    <>
                      {sortedUsers?.slice(1).map((user, index) => (
                        <>
                          {user.name}
                          {index !== sortedUsers.length - 2 && ", "}
                        </>
                      ))}
                    </>
                  ) : (
                    <>
                      {sortedUsers
                        ?.slice(1, sortedUsers.length - 2)
                        .map((user, index) => (
                          <>
                            {user.name},{" "}
                            {index == sortedUsers.length - 2 && ", ..."}
                          </>
                        ))}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {slicedUsers ? (
                <>
                  {slicedUsers.map((user, index) => (
                    <>
                      {user.name}
                      {index !== sortedUsers.length - 2 && ", "}
                    </>
                  ))}
                </>
              ) : (
                <>
                  {sortedUsers.map((user, index) => (
                    <>
                      {user.name}
                      {index !== sortedUsers.length - 2 && ", "}
                    </>
                  ))}
                </>
              )}
            </>
          )}
        </p>
      );
    }
  };

  const msgPlace = (msg: chatInterface) => {
    return msg.senderuid == eachUser?.uid ? "flex-row-reverse mr-1" : "ml-1";
  };

  const msgShape = (msg: chatInterface) => {
    return msg.senderuid == eachUser?.uid
      ? "rounded-tl-3xl rounded-br-3xl px-3 bg-skyblue text-stone-100"
      : "rounded-tr-3xl rounded-bl-3xl px-3 bg-stone-300 text-stone-900 mt-0";
  };

  const myMsg = (msg: chatInterface) => {
    if (msg.senderuid == eachUser?.uid) {
      return true;
    }
  };

  return (
    <>
      <div className={`${isMobile && "h-screen"}`}>
        <div className="w-full py-1 lg:pb-0 sticky top-0 flex align-center justify-between bg-water-700">
          <div className={` flex ${!isMobile && "ml-4"}`}>
            {isMobile && (
              <IconButton
                className="mt-1"
                aria-label="Voltar"
                icon={<BiArrowBack size={20} color="white" />}
                bg="none"
                onClick={() => navigate("/")}
              />
            )}
            <Avatar src={currChat?.groupIcon} />
            <div className="pl-4 flex flex-col" id="group-header">
              <p className="text-lg mt-1 font-sans font-semibold text-stone-100">
                {currChat?.title}
              </p>
              <div className="flex text-sm font-sans font-normal text-stone-500">
                {groupUsers()}
                {/* {isMobile ? (
                  groupUsers()
                ) : (
                  <>
                    Você, {""}
                    {sortedUsers.slice(1, 7).map((user, index) => (
                      <p>
                        {user.name}
                        {index == sortedUsers.slice(1, 7).length - 2
                          ? ", ..."
                          : " ,"}
                      </p>
                    ))}
                  </>
                )} */}
              </div>
            </div>
          </div>
          <div className="float-right">
            <GroupConfig />
          </div>
        </div>
        {currChat && (
          <>
            <div className="flex flex-col h-[90%] overflow-hidden">
              <div className="h-[92%] lg:h-[720px] xl:h-[850px] overflow-y-auto">
                {currChat.messages.length > 0 && (
                  <>
                    {currChat.messages.map((msg) => (
                      <div className={`flex ${msgPlace(msg)} mt-2 mb-2 `}>
                        {myMsg(msg) ? (
                          <div className={`max-w-[80%] ${msgShape(msg)}`}>
                            <p className={`text-sm font-sans p-1 leading-3`}>
                              {msg.content}
                            </p>
                            <p
                              className={`text-xs ${
                                myMsg(msg)
                                  ? "text-stone-300"
                                  : "text-stone-700 flex flex-row-reverse"
                              }`}
                            >
                              {msg.time}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="text-xs font-sans bg-stone-300 rounded-t-xl px-1 inline-block border-2 border-stone-300">
                                {msg.sender}
                              </p>
                              <div
                                className={`min-w-[120px] max-w-[200px] ${msgShape(
                                  msg
                                )}`}
                              >
                                <p className={`text-sm font-sans pt-1`}>
                                  {msg.content}
                                </p>
                                <p
                                  className={`text-xs ${
                                    myMsg(msg)
                                      ? "text-stone-300"
                                      : "text-stone-700 flex flex-row-reverse"
                                  }`}
                                >
                                  {msg.time}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="text-center">
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
                  className="ml-2"
                  onClick={sendMsg}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default GroupChat;
