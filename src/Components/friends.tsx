import React, { useContext, useState, useEffect } from "react";
import { AppContext, userInterface } from "../Context/AuthContext";
import {
  arrayUnion,
  doc,
  DocumentData,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, IconButton } from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineSend, AiOutlineUserAdd } from "react-icons/ai";
import { GrSend } from "react-icons/gr";
import { FaTelegramPlane } from "react-icons/fa";

function FriendList() {
  let navigate = useNavigate();
  const { eachUser, setEachUser, isAuth, setPartner } = useContext(AppContext);

  useEffect(() => {
    document.body.style.backgroundColor = "#F0EFEB";
  }, []);

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
    navigate("/chat");
  };

  return (
    <div className="h-screen">
      {eachUser ? (
        <>
          {eachUser?.friends.length > 0 ? (
            <>
              <div className="w-[95%] m-auto mt-4">
                {eachUser?.friends.map((user, index) => (
                  <div className="flex align-center justify-between mt-4 p-1 shadow-lg bg-[#FDFDFC] rounded-full rounded-l-full border-b border-l border-skyblue">
                    <div className="">
                      <Avatar src={user.avatar} />
                    </div>
                    <p className="text-lg font-sans font-semibold px-10 leading-[45px]">
                      {user.name}
                    </p>
                    <IconButton
                      className="mt-1"
                      aria-label="Enviar mensagem"
                      icon={<FaTelegramPlane size={32} color="#48D6D2" />}
                      bg="transparent"
                      rounded="full"
                      onClick={() => startChat(index)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <h1 className="font-sans p-2 text-2xl font-medium text-center mt-5">
                Parece que você ainda não tem nenhum amigo.
              </h1>
              <Button
                className="m-auto mt-8 w-5/6"
                leftIcon={<AiOutlineUserAdd size={25} />}
                colorScheme="messenger"
                onClick={() => {
                  navigate("/add-friend");
                }}
              >
                Adicionar amigo
              </Button>
            </div>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default FriendList;
