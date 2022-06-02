import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button } from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineUserAdd } from "react-icons/ai";

function FriendList() {
  let navigate = useNavigate();
  const { eachUser, setEachUser, isAuth, setPartner, setGroupId } =
    useContext(AppContext);

  useEffect(() => {
    document.body.style.backgroundColor = "#fffff5";
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
  return (
    <div className="h-screen">
      {eachUser ? (
        <>
          {eachUser?.friends.length == 0 ? (
            <>
              <div className="inline-block">
                <h1 className="p-2 text-xl text-stone-100 rounded-br-lg font-sans font-bold bg-skyblue">
                  Amigos
                </h1>
              </div>
              <div className="w-5/6 m-auto mt-4">
                {eachUser?.sentReq.map((user) => (
                  <div className="flex align-center mt-4">
                    <Avatar src={user.avatar} />
                    <p className="text-xl font-sans font-semibold px-10 leading-[45px]">
                      {user.name}
                    </p>
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
