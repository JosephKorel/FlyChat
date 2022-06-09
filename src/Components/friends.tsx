import React, { useContext, useState, useEffect } from "react";
import { AppContext, eachUserInt, userInterface } from "../Context/AuthContext";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaTelegramPlane } from "react-icons/fa";
import { IoPersonRemove } from "react-icons/io5";
import { TiDelete } from "react-icons/ti";

function FriendList() {
  let navigate = useNavigate();
  const { eachUser, setEachUser, isAuth, setPartner } = useContext(AppContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const removeFriend = async (index: number) => {
    const docRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friend: userInterface | undefined = eachUser?.friends[index];
    const friendDoc = doc(db, "eachUser", `${friend?.uid}`);
    const docSnap: DocumentData = await getDoc(docRef);
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

    console.log(eachUser?.friends);
    console.log(eachUser?.friends.filter((frd) => frd.uid !== friend?.uid));

    await updateDoc(docRef, {
      friends: filteredFr,
      chats: filteredChats,
    });

    await updateDoc(friendDoc, {
      friends: filteredMe,
      chats: filteredFrdChats,
    });
  };

  const ModalComponent = (component: React.ReactNode) => {
    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Remover amigos</ModalHeader>
            <ModalCloseButton />
            <ModalBody>{component}</ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  onClose();
                }}
                bg="gray.200"
              >
                Cancelar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  const removeFriends = (
    <>
      {eachUser?.friends.map((user, index) => (
        <div className="flex align-center justify-between mt-4 p-1">
          <div>
            <Avatar src={user.avatar} />
          </div>
          <p className="text-lg font-sans font-semibold px-10 leading-[45px]">
            {user.name}
          </p>
          <IconButton
            className="mt-1"
            aria-label="Excluir amigo"
            icon={<TiDelete size={32} color="#e63946" />}
            bg="transparent"
            rounded="full"
            onClick={() => removeFriend(index)}
          />
        </div>
      ))}
    </>
  );

  return (
    <>
      <div className="">
        {eachUser ? (
          <>
            {eachUser?.friends.length > 0 ? (
              <>
                <div className="w-[95%] sm:w-2/3 m-auto mt-4">
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
                <div className="fixed bottom-16 float-right right-4 z-10">
                  <IconButton
                    aria-label="Gerenciar amigos"
                    icon={<IoPersonRemove color="white" />}
                    bg="#e63946"
                    rounded="full"
                    onClick={onOpen}
                  />
                </div>
                {ModalComponent(removeFriends)}
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
    </>
  );
}

export default FriendList;