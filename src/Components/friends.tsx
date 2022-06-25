import React, { useContext, useEffect } from "react";
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
import ChatPage from "./chat";
import AddFriend from "./add-friend";

function FriendList() {
  let navigate = useNavigate();
  const { eachUser, setEachUser, setPartner, isMobile, setChatPage } =
    useContext(AppContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    document.body.style.background = "url(./Meteor.svg)";
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
      <div className="overflow-auto">
        {eachUser ? (
          <>
            {eachUser?.friends.length > 0 ? (
              <>
                <div className="w-[98%] sm:w-2/3 lg:w-[95%] m-auto py-1 h-[80vh] overflow-auto">
                  {eachUser?.friends.map((user, index) => (
                    <div className="flex align-center justify-between mt-4 p-1 shadow-lg bg-stone-200 rounded-xl border-x-2 border-stone-800 text-stone-900">
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
                <div
                  className={`fixed  ${
                    isMobile ? "right-4 bottom-16" : "left-0 bottom-1/4"
                  }`}
                >
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
              <>
                {isMobile && (
                  <div className="text-center">
                    <h1 className="font-sans p-2 text-2xl font-medium text-center mt-5 text-stone-100">
                      Parece que você ainda não tem nenhum amigo.
                    </h1>
                    <Button
                      className="m-auto mt-8 w-5/6"
                      leftIcon={<AiOutlineUserAdd size={25} />}
                      colorScheme="messenger"
                      onClick={() => navigate("/add-friend")}
                    >
                      Adicionar amigo
                    </Button>
                  </div>
                )}{" "}
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
