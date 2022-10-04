import React, { useContext, useEffect, useState } from "react";
import { AppContext, eachUserInt, userInterface } from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineClose, AiOutlineUserAdd } from "react-icons/ai";
import { FaTelegramPlane } from "react-icons/fa";
import { IoPersonRemove } from "react-icons/io5";
import { TiDelete } from "react-icons/ti";
import ChatPage from "./chat";
import Modal from "../Styled-components/modal";

function FriendList() {
  const [show, setShow] = useState(false);
  let navigate = useNavigate();
  const { eachUser, setEachUser, setPartner, isMobile, setChatPage } =
    useContext(AppContext);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "eachUser", user.uid);
        const docSnap: DocumentData = await getDoc(docRef);
        setEachUser(docSnap.data());
      }
    });
  }, [onAuthStateChanged]);

  const startChat = async (index: number) => {
    const friend: userInterface | undefined = eachUser?.friends[index];

    setPartner(friend?.uid!);
    isMobile
      ? navigate("/chat")
      : setChatPage({ page: <ChatPage />, title: "chat" });
  };

  const removeFriend = async (index: number) => {
    const docRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friend: userInterface | undefined = eachUser?.friends[index];
    const friendDoc = doc(db, "eachUser", `${friend?.uid}`);
    const frDocSnap: DocumentData = await getDoc(friendDoc);
    const currentFrdDoc: eachUserInt = frDocSnap.data();

    const filteredFr = eachUser?.friends.filter(
      (frd) => frd.uid !== friend?.uid
    );
    const filteredChats = eachUser?.chats.filter(
      (chat) => chat.users[1].uid !== friend?.uid
    );

    const filteredMe = currentFrdDoc.friends.filter(
      (item) => item.uid !== auth.currentUser?.uid
    );
    const filteredFrdChats = currentFrdDoc.chats.filter(
      (chat) => chat.users[1].uid !== eachUser?.uid
    );

    await updateDoc(docRef, {
      friends: filteredFr,
      chats: filteredChats,
    });

    await updateDoc(friendDoc, {
      friends: filteredMe,
      chats: filteredFrdChats,
    });
    !isMobile && window.location.reload();
  };

  const RemoveFriends = (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-md bg-dark-400 p-2"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-lg text-gray-100">Remover amigos</h1>
        <button onClick={() => setShow(false)}>
          <AiOutlineClose className="text-gray-100 text-lg" />
        </button>
      </div>

      {eachUser?.friends.map((user, index) => (
        <div className="flex items-center justify-between mt-4 p-1">
          <div>
            <Avatar src={user.avatar} size="sm" />
          </div>
          <p className="text-lg uppercase font-semibold text-gray-100">
            {user.name}
          </p>
          <button
            className="px-2 py-1 bg-red-500 rounded-md"
            onClick={() => removeFriend(index)}
          >
            <p className="text-white text-sm">EXCLUIR</p>
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="overflow-auto bg-dark h-screen font-sans">
        {show && <Modal children={RemoveFriends} setShow={setShow} />}
        {eachUser ? (
          <>
            {eachUser?.friends.length > 0 ? (
              <>
                <div className="w-full p-4 sm:w-2/3 lg:w-[95%] m-auto py-1 h-screen overflow-auto">
                  {eachUser!.friends.map((user, index) => (
                    <div className="flex items-center justify-between mt-4 py-1 px-4 rounded-xl bg-gradient-to-r from-dark-800 to-dark">
                      <div className="">
                        <img
                          src={user.avatar}
                          referrerPolicy="no-referrer"
                          className="w-8 rounded-full"
                        ></img>
                      </div>
                      <p className="font-bold uppercase text-lime px-10">
                        {user.name}
                      </p>
                      <button className="" onClick={() => startChat(index)}>
                        <FaTelegramPlane className="text-lime text-2xl" />
                      </button>
                    </div>
                  ))}
                </div>
                <div
                  className={`fixed  ${
                    isMobile ? "right-4 bottom-16" : "left-0 bottom-1/4"
                  }`}
                >
                  <button
                    className="p-2 rounded-md bg-red-500"
                    onClick={() => setShow(true)}
                  >
                    <IoPersonRemove className="text-white text-xl" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {isMobile && (
                  <div className="text-center">
                    <h1 className="p-2 text-2xl font-medium text-center mt-5 text-stone-100">
                      Parece que você ainda não tem nenhum amigo.
                    </h1>
                    <button
                      className="m-auto mt-8 w-5/6 p-2 rounded-md flex justify-center items-center gap-2 bg-lime text-dark"
                      onClick={() => navigate("/add-friend")}
                    >
                      <AiOutlineUserAdd className="text-xl" />
                      <p className="font-semibold">ADICIONAR AMIGO</p>
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default FriendList;
