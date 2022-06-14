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
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useContext, useState, useEffect } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { AiFillCamera, AiOutlineUpload } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { MdSettings } from "react-icons/md";
import { useLocation, useNavigate } from "react-router";
import { AppContext, groupChatInt } from "../Context/AuthContext";
import { auth, db, storage } from "../firebase-config";

function GroupConfig() {
  const { eachUser, groupId, setEachUser, isMobile, setChatPage, chatPage } =
    useContext(AppContext);
  const [icon, setIcon] = useState<any>(null);
  const [currChat, setCurrChat] = useState<groupChatInt | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  let navigate = useNavigate();
  let location = useLocation().pathname;

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

  const changeIcon = () => {
    let uniqueId = "";
    const storageRef = ref(storage, `groupIcon/${uniqueId}`);

    uploadBytes(storageRef, icon).then((res) => console.log("success"));

    getDownloadURL(ref(storage, `groupIcon/${uniqueId}`)).then((url) => {
      currChat?.users.forEach(async (user) => {
        const docRef = doc(db, "eachUser", `${user.uid}`);
        const docSnap = await getDoc(docRef);
        const docData = docSnap.data();
        const chats: groupChatInt[] = docData?.groupChat;

        chats.forEach((item) => {
          if (item.id == groupId) {
            item.groupIcon = url;
          }
        });

        await updateDoc(docRef, { groupChat: chats });
      });
    });
    onClose();
  };

  const deleteGroup = () => {
    currChat?.users.forEach(async (user) => {
      const docRef = doc(db, "eachUser", `${user.uid}`);
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data();
      const chats: groupChatInt[] = docData?.groupChat;

      const filteredChat = chats.filter((item) => item.id !== groupId);

      await updateDoc(docRef, { groupChat: filteredChat });
    });

    isMobile ? navigate("/user-chats") : navigate("/");
  };

  return (
    <div>
      {location == "/group-config" ? (
        <>
          <div>
            <IconButton
              className="mt-1"
              aria-label="Voltar"
              icon={<BiArrowBack size={20} color="#2A6FDB" />}
              bg="none"
              onClick={() => navigate("/group-chat")}
            />
          </div>
          <div className="text-center mt-4">
            <div>
              <Avatar src={currChat?.groupIcon} size="2xl" />
              <IconButton
                className="mt-1 absolute"
                aria-label="Alterar foto"
                icon={<AiFillCamera size={20} color="#2A6FDB" />}
                bg="none"
                onClick={onOpen}
                position="absolute"
              />
            </div>
            <h1 className="mt-2 text-xl font-sans font-semibold">
              {currChat?.title}
            </h1>
            <div className="w-5/6 bg-skyblue h-1 m-auto rounded-full mt-2"></div>
          </div>
          <div className="ml-4 mt-6">
            <h2 className="font-sans text-xl font-semibold">Membros</h2>
            {currChat && (
              <div className="flex flex-col">
                {currChat.users.map((user) => (
                  <div className="flex mt-3">
                    <Avatar src={user.avatar} />
                    <p className="font-sans ml-4 mt-3">{user.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {currChat?.users[0].uid == auth.currentUser?.uid && (
            <Button
              onClick={deleteGroup}
              colorScheme="red"
              className="ml-3 mt-12"
            >
              Excluir grupo
            </Button>
          )}
          <>
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Alterar foto do grupo</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <div className="flex justify-between mt-4">
                    <p className="font-sans text-base font-medium leading-[45px]">
                      Qual será a nova foto do grupo?
                    </p>
                    <IconButton
                      icon={<AiOutlineUpload />}
                      aria-label="Search database"
                      rounded="50%"
                      size="lg"
                      colorScheme="messenger"
                      onClick={() => {
                        document.getElementById("group-img")?.click();
                      }}
                    />
                    <input
                      className="hidden"
                      type="file"
                      id="group-img"
                      onChange={(e) => setIcon(e.target.files?.[0])}
                    ></input>
                  </div>
                  {icon !== null ? <p>{icon.name}</p> : <></>}
                  <Button
                    onClick={changeIcon}
                    colorScheme="messenger"
                    className="mt-5"
                  >
                    Confirmar
                  </Button>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onClose();
                      setIcon(null);
                    }}
                    bg="gray.200"
                  >
                    Cancelar
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        </>
      ) : (
        <div>
          <IconButton
            className="mt-1"
            aria-label="Configurações"
            icon={<MdSettings size={20} color="white" />}
            bg="none"
            onClick={() => {
              isMobile
                ? navigate("/group-config")
                : setChatPage(<GroupConfig />);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default GroupConfig;
