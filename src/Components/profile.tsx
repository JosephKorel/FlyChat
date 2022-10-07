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
import { Avatar, IconButton, Button, useDisclosure } from "@chakra-ui/react";
import { BsPencilFill } from "react-icons/bs";
import { AiFillCamera, AiOutlineUpload } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router";
import { GoSignOut } from "react-icons/go";
import Modal from "../Styled-components/modal";

function Profile() {
  const { setUsers, eachUser, setEachUser, setIsAuth, isMobile } =
    useContext(AppContext);
  const [username, setUsername] = useState(eachUser!.name);
  const [profileImg, setProfileImg] = useState<any | null>(null);
  const [bgImg, setBgImg] = useState<any | null>(null);
  const [editName, setEditName] = useState<boolean>(false);
  const [show, setShow] = useState(false);
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

  const changeUsername = async () => {
    if (auth.currentUser) {
      if (!username) {
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

      //Alterar no documento allUsers
      const allUsersDoc = doc(db, "allUsers", "list");
      const docData = await getDoc(allUsersDoc);
      const docResult: DocumentData | undefined = docData.data();
      const usersList: userInterface[] = docResult?.users;

      const usersMap = usersList.map((user) => {
        return user.uid == eachUser?.uid ? { ...user, name: username } : user;
      });

      await updateDoc(allUsersDoc, {
        users: usersMap,
      });

      //Alterar no documento de cada outro usuário
      let eachUserList: eachUserInt[] = [];

      const colQuery = query(collection(db, "eachUser"));
      const queryData = await getDocs(colQuery);
      queryData.forEach((doc: DocumentData) => eachUserList.push(doc.data()));

      const filteredUserList = eachUserList.filter(
        (item) => item.uid != auth.currentUser?.uid
      );

      //Alterar nos campos de cada usuário
      filteredUserList.forEach((item) => {
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

        updateDoc(docRef, {
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

      try {
        //Upload de imagem
        await uploadBytes(storageRef, profileImg);

        const imgURL = await getDownloadURL(
          ref(storage, `profileImg/${auth.currentUser.uid}`)
        );

        //Atualizar em allUsers
        usersList.forEach((item) => {
          if (item.uid == auth.currentUser?.uid) {
            item.avatar = imgURL;
          }
        });

        myChats.forEach((item) =>
          item.users.forEach((user) => {
            if (user.uid == auth.currentUser?.uid) {
              user.avatar = imgURL;
            }
          })
        );

        myGroupChat.forEach((item) => {
          item.users.forEach((user) => {
            if (user.uid == auth.currentUser?.uid) {
              user.avatar = imgURL;
            }
          });
        });

        //Atualiza em eachUser dos outros usuários
        filteredUserList.forEach((item) => {
          const otherUsersDoc = doc(db, "eachUser", `${item.uid}`);
          item.friends.forEach((friend) => {
            if (friend.uid == auth.currentUser?.uid) {
              friend.avatar = imgURL;
            }
          });
          item.chats.forEach((chat) => {
            chat.users.forEach((user) => {
              if (user.uid == auth.currentUser?.uid) {
                user.avatar = imgURL;
              }
            });
            item.requests.forEach((req) => {
              if (req.uid == auth.currentUser?.uid) {
                req.avatar = imgURL;
              }
            });
          });

          item.groupChat.forEach((chat) =>
            chat.users.forEach((user) => {
              if (user.uid == auth.currentUser?.uid) {
                user.avatar = imgURL;
              }
            })
          );

          item.sentReq.forEach((sentreq) => {
            if (sentreq.uid == auth.currentUser?.uid) {
              sentreq.avatar = imgURL;
            }
          });
          updateDoc(otherUsersDoc, {
            friends: item.friends,
            chats: item.chats,
            groupChat: item.groupChat,
            requests: item.requests,
            sentReq: item.sentReq,
          });
          onClose();
        });

        await updateDoc(allUsersDoc, { users: usersList });

        //Atualiza o perfil do usuário
        await updateProfile(auth.currentUser!, { photoURL: imgURL });

        await updateDoc(myDocRef, {
          avatar: imgURL,
          chats: myChats,
          groupChat: myGroupChat,
        });
      } catch (error) {}

      /* //Pegar o URL da imagem
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
        }
      ); */
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
      isMobile ? navigate("/") : navigate("/login");
    });
  };

  const changeProfileImgComponent = (
    <div
      className="bg-dark-400 font-sans p-2 px-4 rounded-md flex flex-col items-start"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mt-4 w-full">
        <p className="text-gray-100 font-medium">Qual será sua nova foto?</p>
        <button
          onClick={() => {
            document.getElementById("profile-img")?.click();
          }}
          className="p-2 text-lg text-dark bg-lime rounded-full"
        >
          <AiOutlineUpload />
        </button>
        <input
          className="hidden"
          type="file"
          id="profile-img"
          onChange={(e) => setProfileImg(e.target.files?.[0])}
        ></input>
      </div>
      {profileImg ? (
        <p className="text-gray-300 text-sm">{profileImg.name}</p>
      ) : (
        <></>
      )}
      <button
        onClick={changeProfileImg}
        className="mt-5 text-right rounded-md text-dark bg-lime py-1 px-3 text-sm"
      >
        Confirmar
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-dark text-center">
      {show && <Modal children={changeProfileImgComponent} setShow={setShow} />}
      <div className="w-5/6 m-auto text-center translate-y-1/3">
        <div className="flex justify-center relative w-1/2 m-auto">
          {/* <Avatar
            src={eachUser?.avatar || ""}
            size="xl"
            referrerPolicy="no-referrer"
          ></Avatar> */}
          <img
            src={eachUser?.avatar}
            className="w-24 rounded-full"
            referrerPolicy="no-referrer"
          ></img>
          <button
            onClick={() => setShow(true)}
            className="absolute right-4 p-2 bg-lime text-dark text-lg rounded-full"
          >
            <AiFillCamera />
          </button>
        </div>
        <div className="mt-2 flex justify-center items-center relative">
          <input
            className="rounded-md w-2/3 text-center font-semibold py-1 px-3 outline-none bg-gray-100 text-dark border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
            value={editName ? username : eachUser?.name}
            disabled={editName ? false : true}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          {editName ? (
            <button
              className="absolute right-0 rounded-full p-2 text-dark bg-lime"
              onClick={() => {
                changeUsername();
                setEditName(false);
              }}
            >
              <FaCheck />
            </button>
          ) : (
            <button
              className="absolute right-0 rounded-full p-2 text-dark bg-lime"
              onClick={() => setEditName(true)}
            >
              <BsPencilFill />
            </button>
          )}
        </div>
      </div>
      <div className="fixed right-4 bottom-[4.5rem] md:mt-20">
        <button
          className="bg-red-500 p-2 rounded-md text-gray-100"
          onClick={logOut}
        >
          <GoSignOut className="text-lg" />
          {/* <p className="text-sm">SAIR</p> */}
        </button>
      </div>
    </div>
  );
}

export default Profile;
