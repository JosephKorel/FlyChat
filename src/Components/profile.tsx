import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import {
  AppContext,
  eachUserInt,
  userInterface,
  eachChat,
  groupChatInt,
} from "../Context/AuthContext";
import { auth, db, storage } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { signOut, updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Avatar,
  IconButton,
  Input,
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
import { BsPencilFill } from "react-icons/bs";
import { AiFillCamera, AiOutlineUpload } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router";

function Profile() {
  const { setUsers, eachUser, setEachUser, setIsAuth } = useContext(AppContext);
  const [username, setUsername] = useState<string>("");
  const [profileImg, setProfileImg] = useState<any | null>(null);
  const [bgImg, setBgImg] = useState<any | null>(null);
  const [editName, setEditName] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  let navigate = useNavigate();

  //Atualização em tempo-real
  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  const [allUsersDoc] = useDocumentData(doc(db, "allUsers", "list"));

  const docUpdate = async () => {
    const userDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const data: DocumentData = await getDoc(userDoc);
    setEachUser(data.data());
  };

  useEffect(() => {
    docUpdate();
  }, [eachUserDoc]);

  const getUsers = async () => {
    const docRef = doc(db, "allUsers", "list");
    const docSnap: DocumentData = await getDoc(docRef);
    setUsers(docSnap.data().users);
  };

  const getEachUser = async (userId: string) => {
    const docRef = doc(db, "eachUser", userId);
    const docSnap: DocumentData = await getDoc(docRef);
    setEachUser(docSnap.data());
  };

  // Pega todos os usuários cadastrados
  useEffect(() => {
    getUsers();
    if (auth.currentUser) {
      getEachUser(auth.currentUser.uid);
    }
  }, [allUsersDoc]);

  const removeFriend = async (index: number) => {
    const docRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friend: userInterface | undefined = eachUser?.friends[index];
    const friendDoc = doc(db, "eachUser", `${friend?.uid}`);
    const docSnap: DocumentData = await getDoc(docRef);
    const frDocSnap: DocumentData = await getDoc(friendDoc);
    const currentDoc = docSnap.data();
    const currentFrdDoc: eachUserInt = frDocSnap.data();
    const filteredFr = currentDoc.friends.filter(
      (item: userInterface) => item.name !== friend?.name
    );
    const filteredMe = currentFrdDoc.friends.filter(
      (item: userInterface) => item.name !== auth.currentUser?.displayName
    );

    const friendIndex = eachUser?.chats.findIndex((item) =>
      item.users.filter((obj) => obj.uid == friend?.uid)
    );

    const myIndex = currentFrdDoc.chats.findIndex((item) =>
      item.users.filter((obj) => obj.uid == eachUser?.uid)
    );

    const myNewChat = eachUser?.chats.slice();
    myNewChat?.splice(friendIndex!, 1);

    const newFrdChat = currentFrdDoc.chats.slice();
    newFrdChat?.splice(myIndex!, 1);

    await updateDoc(docRef, {
      friends: filteredFr,
      chats: myNewChat,
    });

    await updateDoc(friendDoc, {
      friends: filteredMe,
      chats: newFrdChat,
    });
  };

  const changeUsername = async () => {
    if (auth.currentUser) {
      if (username == "") {
        setEditName(false);
        return;
      }

      //Alterar o perfil e depois em eachUser
      const docRef = doc(db, "eachUser", `${auth.currentUser.uid}`);
      const myDocData = await getDoc(docRef);
      const myDocResults: DocumentData | undefined = myDocData.data();
      const myChats: eachChat[] = myDocResults?.chats;
      const myGroupChat: groupChatInt[] = myDocResults?.groupChat;

      //Altera o nome em cada chat do próprio usuário
      myChats.forEach((item) => {
        item.users[0].name = username;
        item.messages.forEach((msg) => {
          if (msg.senderuid == auth.currentUser?.uid) {
            msg.sender = username;
          }
        });
      });

      myGroupChat.forEach((item) => {
        item.users.forEach((user) => {
          if (user.uid == auth.currentUser?.uid) {
            user.name = username;
          }
        });
        item.messages.forEach((msg) => {
          if (msg.senderuid == auth.currentUser?.uid) {
            msg.sender = username;
          }
        });
      });

      //Altera o nome no perfil
      await updateProfile(auth.currentUser, { displayName: username });

      //Altera em eachUser
      await updateDoc(docRef, {
        name: username,
        chats: myChats,
        groupChat: myGroupChat,
      });
      setUsername("");

      //Alterar no documento allUsers
      const allUsersDoc = doc(db, "allUsers", "list");
      const docData = await getDoc(allUsersDoc);
      const docResult: DocumentData | undefined = docData.data();
      const usersList: userInterface[] = docResult?.users;
      const userIndex = usersList.findIndex(
        (item) => item.uid == eachUser?.uid
      );
      const newUsers = usersList.slice();
      newUsers[userIndex].name = username;

      await updateDoc(allUsersDoc, {
        users: newUsers,
      });

      //Alterar no documento de cada usuário
      let eachUserList: eachUserInt[] = [];

      const colQuery = query(collection(db, "eachUser"));
      const queryData = await getDocs(colQuery);
      queryData.forEach((doc: DocumentData) => eachUserList.push(doc.data()));

      const filteredUserList = eachUserList.filter(
        (item) => item.uid !== auth.currentUser?.uid
      );

      //Alterar nos campos de cada usuário
      filteredUserList.forEach(async (item) => {
        const docRef = doc(db, "eachUser", `${item.uid}`);

        //Alterar nos amigos de cada usuário
        item.friends.forEach((friend) => {
          if (friend.uid == auth.currentUser?.uid) {
            friend.name = username;
          }
        });

        //Altera no chat de cada usuário
        item.chats.forEach((chat) => {
          chat.users.forEach((user) => {
            if (user.uid == auth.currentUser?.uid) {
              user.name = username;
            }
          });
          chat.messages.forEach((msg) => {
            if (msg.senderuid == auth.currentUser?.uid) {
              msg.sender = username;
            }
          });
        });

        item.groupChat.forEach((chat) => {
          chat.users.forEach((user) => {
            if (user.uid == auth.currentUser?.uid) {
              user.name = username;
            }
          });
          chat.messages.forEach((item) => {
            if (item.senderuid == auth.currentUser?.uid) {
              item.senderuid = username;
            }
          });
        });

        //Altera no campo requests
        item.requests.forEach((req) => {
          if (req.uid == auth.currentUser?.uid) {
            req.name = username;
          }
        });

        //Altera no campo sentReq
        item.sentReq.forEach((sentreq) => {
          if (sentreq.uid == auth.currentUser?.uid) {
            sentreq.name = username;
          }
        });

        await updateDoc(docRef, {
          friends: item.friends,
          requests: item.requests,
          sentReq: item.sentReq,
          chats: item.chats,
          groupChat: item.groupChat,
        });
      });
    }
  };

  const changeProfileImg = async () => {
    if (auth.currentUser) {
      const storageRef = ref(storage, `profileImg/${auth.currentUser.uid}`);
      const myDocRef = doc(db, "eachUser", `${auth.currentUser.uid}`);
      const allUsersDoc = doc(db, "allUsers", "list");
      const docData = await getDoc(allUsersDoc);
      const docResult: DocumentData | undefined = docData.data();
      const usersList: userInterface[] = docResult?.users;
      const myDocData = await getDoc(myDocRef);
      const myDocResults: DocumentData | undefined = myDocData.data();
      const myChats: eachChat[] = myDocResults?.chats;
      const myGroupChat: groupChatInt[] = myDocResults?.groupChat;

      let eachUserList: eachUserInt[] = [];

      const colQuery = query(collection(db, "eachUser"));
      const queryData = await getDocs(colQuery);
      queryData.forEach((doc: DocumentData) => eachUserList.push(doc.data()));
      //eachUser de todos os outros usuários
      const filteredUserList = eachUserList.filter(
        (item) => item.uid !== auth.currentUser?.uid
      );

      if (profileImg == null) return;

      //Upload de imagem
      uploadBytes(storageRef, profileImg).then((res) => console.log("success"));

      //Pegar o URL da imagem
      getDownloadURL(ref(storage, `profileImg/${auth.currentUser.uid}`)).then(
        async (url) => {
          //Atualizar em allUsers
          usersList.forEach((item) => {
            if (item.uid == auth.currentUser?.uid) {
              item.avatar = url;
            }
          });
          await updateDoc(allUsersDoc, { users: usersList });

          //Atualiza o perfil do usuário
          await updateProfile(auth.currentUser!, { photoURL: url });

          //Atualiza em eachUser
          myChats.forEach((item) =>
            item.users.forEach((user) => {
              if (user.uid == auth.currentUser?.uid) {
                user.avatar = url;
              }
            })
          );

          myGroupChat.forEach((item) => {
            item.users.forEach((user) => {
              if (user.uid == auth.currentUser?.uid) {
                user.avatar = url;
              }
            });
          });

          await updateDoc(myDocRef, {
            avatar: url,
            chats: myChats,
            groupChat: myGroupChat,
          });

          //Atualiza em eachUser dos outros usuários
          filteredUserList.forEach(async (item) => {
            const otherUsersDoc = doc(db, "eachUser", `${item.uid}`);
            item.friends.forEach((friend) => {
              if (friend.uid == auth.currentUser?.uid) {
                friend.avatar = url;
              }
            });
            item.chats.forEach((chat) => {
              chat.users.forEach((user) => {
                if (user.uid == auth.currentUser?.uid) {
                  user.avatar = url;
                }
              });
              item.requests.forEach((req) => {
                if (req.uid == auth.currentUser?.uid) {
                  req.avatar = url;
                }
              });
            });

            item.groupChat.forEach((chat) =>
              chat.users.forEach((user) => {
                if (user.uid == auth.currentUser?.uid) {
                  user.avatar = url;
                }
              })
            );

            item.sentReq.forEach((sentreq) => {
              if (sentreq.uid == auth.currentUser?.uid) {
                sentreq.avatar = url;
              }
            });
            await updateDoc(otherUsersDoc, {
              friends: item.friends,
              chats: item.chats,
              groupChat: item.groupChat,
              requests: item.requests,
              sentReq: item.sentReq,
            });
          });
        }
      );
    }
  };

  const changeBg = async () => {
    if (auth.currentUser) {
      const storageRef = ref(storage, `chatBg/${auth.currentUser.uid}`);
      const myDocRef = doc(db, "eachUser", `${auth.currentUser.uid}`);

      await uploadBytes(storageRef, bgImg).then((res) =>
        console.log("success")
      );

      getDownloadURL(ref(storage, `chatBg/${auth.currentUser.uid}`)).then(
        async (url) => {
          await updateDoc(myDocRef, {
            chatBg: url,
          });
        }
      );
    }
  };

  const logOut = async () => {
    signOut(auth).then(() => {
      setIsAuth(false);
      navigate("/");
    });
  };

  const changeProfileImgComponent = (
    <>
      <div className="flex justify-between mt-4">
        <p className="font-sans text-base font-medium leading-[45px]">
          Qual será sua nova foto?
        </p>
        <IconButton
          icon={<AiOutlineUpload />}
          aria-label="Search database"
          rounded="50%"
          size="lg"
          colorScheme="messenger"
          onClick={() => {
            document.getElementById("profile-img")?.click();
          }}
        />
        <input
          className="hidden"
          type="file"
          id="profile-img"
          onChange={(e) => setProfileImg(e.target.files?.[0])}
        ></input>
      </div>
      {profileImg ? <p>{profileImg.name}</p> : <></>}
      <Button
        onClick={changeProfileImg}
        colorScheme="messenger"
        className="mt-5"
      >
        Confirmar
      </Button>
    </>
  );

  const ModalComponent = (component: React.ReactNode) => {
    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Alterar foto de perfil</ModalHeader>
            <ModalCloseButton />
            <ModalBody>{component}</ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  onClose();
                  setProfileImg(null);
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

  return (
    <div className="h-screen">
      {/*  <div className="inline-block">
        <h1 className="p-2 px-4 text-md text-stone-100 rounded-br-lg font-sans font-bold bg-skyblue">
          Perfil
        </h1>
      </div> */}
      <div className="w-5/6 m-auto text-center mt-4">
        <div className="flex justify-center">
          <Avatar src={eachUser?.avatar || ""} size="2xl"></Avatar>
          <IconButton
            className="mt-1 ml-20"
            aria-label="Alterar foto"
            icon={<AiFillCamera size={20} color="white" />}
            bg="#2A6FDB"
            rounded="full"
            position="absolute"
            onClick={onOpen}
          />
        </div>
        <div className="mt-2">
          <Input
            width="w-1/2"
            className="text-center font-sans text-xl font-semibold"
            value={editName ? username : eachUser?.name}
            disabled={editName ? false : true}
            variant="flushed"
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setUsername(e.currentTarget.value)
            }
          ></Input>
          {editName ? (
            <IconButton
              className="ml-4"
              position="absolute"
              aria-label="Mudar nome"
              rounded="full"
              bg="#2A6FDB"
              size="sm"
              icon={<FaCheck color="white" />}
              onClick={() => {
                changeUsername();
                setEditName(false);
              }}
            />
          ) : (
            <IconButton
              className="ml-4"
              position="absolute"
              aria-label="Mudar nome"
              rounded="full"
              bg="#2A6FDB"
              size="sm"
              icon={<BsPencilFill color="white" />}
              onClick={() => setEditName(true)}
            />
          )}
        </div>
      </div>
      <div className="ml-4 mt-4">
        <h1 className="text-xl font-sans font-semibold">
          Plano de fundo atual
        </h1>
        <div
          style={{ background: `url(${eachUser?.chatBg})` }}
          className="w-32 h-48 border-2 border-stone-700 rounded-lg mt-4"
        ></div>
        <input
          type="file"
          className="hidden"
          id="chat-img"
          onChange={(e) => setBgImg(e.target.files?.[0])}
        ></input>
        <Button
          className="mt-4"
          onClick={() => {
            bgImg ? changeBg() : document.getElementById("chat-img")?.click();
          }}
          colorScheme="messenger"
        >
          {bgImg ? "Confirmar" : "Alterar"}
        </Button>
        {bgImg ? <p className="mt-2">{bgImg.name}</p> : <></>}
      </div>
      <div className="ml-4 mt-4">
        <Button colorScheme="red" onClick={logOut}>
          Sair
        </Button>
      </div>
      {ModalComponent(changeProfileImgComponent)}
    </div>
  );
}

export default Profile;
