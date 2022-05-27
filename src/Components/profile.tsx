import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  QuerySnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../Context/AuthContext";
import { auth, db, storage } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

function Profile() {
  const { users, setUsers, eachUser, setEachUser, setPartner } =
    useContext(AppContext);
  const [searchFriend, setSearchFriend] = useState<string>("");
  const [searchRes, setSearchRes] = useState<userInterface[]>([]);
  const [username, setUsername] = useState<string>("");
  const [profileImg, setProfileImg] = useState<any | null>(null);

  //Interfaces
  interface userInterface {
    name: string;
    avatar: string;
    uid: string;
  }

  interface chatInterface {
    sender: string;
    avatar: string;
    senderuid: string;
    content: string;
    time: string;
  }

  interface eachUserInt {
    avatar: string;
    name: string;
    uid: string;
    friends: userInterface[];
    requests: userInterface[];
    sentReq: userInterface[];
    chats: { users: userInterface[]; messages: chatInterface[]; id: number }[];
  }

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

  useEffect(() => {
    const otherUsers = users.filter(
      (item) => item.uid !== auth.currentUser?.uid
    );
    const search: userInterface[] = otherUsers.filter((item) =>
      item.name.toLowerCase().includes(searchFriend.toLowerCase())
    );
    let results: userInterface[] = [];

    if (eachUser?.friends.length !== 0) {
      for (let i = 0; i < search.length; i++) {
        eachUser?.friends.forEach((item) => {
          if (item.name !== search[i].name) results.push(search[i]);
        });
      }
      setSearchRes(results);
    } else setSearchRes(search);
  }, [searchFriend]);

  const addFriend = async (index: number) => {
    const friendId = searchRes[index].uid;
    const myDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friendDoc = doc(db, "eachUser", `${friendId}`);

    await updateDoc(friendDoc, {
      requests: arrayUnion({
        name: auth.currentUser?.displayName,
        uid: auth.currentUser?.uid,
        avatar: auth.currentUser?.photoURL,
      }),
    });
    await updateDoc(myDoc, {
      sentReq: arrayUnion({
        name: searchRes[index].name,
        avatar: searchRes[index].avatar,
        uid: searchRes[index].uid,
      }),
    });
  };

  const acceptFriend = async (index: number) => {
    const docRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friend: userInterface | undefined = eachUser?.requests[index];
    const friendDoc = doc(db, "eachUser", `${friend?.uid}`);
    const docSnap: DocumentData = await getDoc(docRef);
    const currentDoc = docSnap.data();
    const friendDocSnap: DocumentData = await getDoc(friendDoc);
    const frdDocData = friendDocSnap.data();
    const id: number = Date.now();

    const filteredReq = currentDoc?.requests.filter(
      (item: userInterface) => item.name !== friend?.name
    );

    const filteredSentReq = frdDocData.sentReq.filter(
      (item: userInterface) => item.uid !== auth.currentUser?.uid
    );

    await updateDoc(docRef, {
      requests: filteredReq,
      friends: arrayUnion({
        name: friend?.name,
        uid: friend?.uid,
        avatar: friend?.avatar,
      }),
      chats: arrayUnion({
        users: [
          {
            name: eachUser?.name,
            avatar: eachUser?.avatar,
            uid: eachUser?.uid,
          },
          { name: friend?.name, avatar: friend?.avatar, uid: friend?.uid },
        ],
        messages: [],
        id,
      }),
    });

    await updateDoc(friendDoc, {
      sentReq: filteredSentReq,
      friends: arrayUnion({
        name: auth.currentUser?.displayName,
        uid: auth.currentUser?.uid,
        avatar: auth.currentUser?.photoURL,
      }),
      chats: arrayUnion({
        users: [
          { name: friend?.name, avatar: friend?.avatar, uid: friend?.uid },
          {
            name: eachUser?.name,
            avatar: eachUser?.avatar,
            uid: eachUser?.uid,
          },
        ],
        messages: [],
        id,
      }),
    });
  };

  const refuseRequest = async (index: number) => {
    const docRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friend: userInterface | undefined = eachUser?.requests[index];
    const docSnap: DocumentData = await getDoc(docRef);
    const friendDoc = doc(db, "eachUser", `${friend?.uid}`);
    const frDocSnap: DocumentData = await getDoc(friendDoc);
    const currentDoc = docSnap.data();
    const currentFrdDoc: eachUserInt = frDocSnap.data();
    const filteredReq = currentDoc?.requests.filter(
      (item: userInterface) => item.name !== friend?.name
    );
    const filteredFrdReq = currentFrdDoc.sentReq.filter(
      (item) => item.name !== auth.currentUser?.displayName
    );

    await updateDoc(docRef, {
      requests: filteredReq,
    });

    await updateDoc(friendDoc, {
      sentReq: filteredFrdReq,
    });
  };

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

  const startChat = async (index: number) => {
    const friend: userInterface | undefined = eachUser?.friends[index];

    setPartner(friend!);
  };

  const changeUsername = async () => {
    if (auth.currentUser) {
      if (username == "") return;

      //Alterar o perfil e depois em eachUser
      const docRef = doc(db, "eachUser", `${auth.currentUser.uid}`);
      const myDocData = await getDoc(docRef);
      const myDocResults: DocumentData | undefined = myDocData.data();
      const myChats: {
        users: userInterface[];
        messages: chatInterface[];
        id: number;
      }[] = myDocResults?.chats;

      //Altera o nome em cada chat do próprio usuário
      myChats.forEach((item) => {
        item.users[0].name = username;
        item.messages.forEach((msg) => {
          if (msg.senderuid == auth.currentUser?.uid) {
            msg.sender = username;
          }
        });
      });

      //Altera o nome no perfil
      await updateProfile(auth.currentUser, { displayName: username });

      //Altera em eachUser
      await updateDoc(docRef, { name: username, chats: myChats });
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
      const myChats: {
        users: userInterface[];
        messages: chatInterface[];
        id: number;
      }[] = myDocResults?.chats;

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
          await updateDoc(myDocRef, { avatar: url, chats: myChats });

          //Atualiza em eachUser dos outros usuários
        }
      );
    }
  };

  return (
    <div>
      <div>
        <img src={eachUser?.avatar || ""} alt="User Avatar"></img>
        <h1>{auth.currentUser?.displayName}</h1>
      </div>
      <div>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        ></input>
        <button onClick={changeUsername}>Alterar</button>
        <br></br>
        <input
          type="file"
          onChange={(e) => setProfileImg(e.target.files?.[0])}
          value={username}
        ></input>
        <button onClick={changeProfileImg}>Alterar</button>
      </div>
      <div>Adicionar amigos:</div>
      <input
        type="text"
        placeholder="Procurar amigo"
        value={searchFriend}
        onChange={(e) => setSearchFriend(e.target.value)}
      ></input>
      <div>
        <ul>
          {searchFriend &&
            searchRes.map((item, index) => (
              <li>
                <img src={item.avatar} alt="Avatar"></img>
                {item.name}
                {eachUser?.sentReq.filter((obj) => obj.uid == item.uid)
                  .length == 1 ? (
                  <h2>Solicitação enviada</h2>
                ) : (
                  <button onClick={() => addFriend(index)}>Adicionar</button>
                )}
              </li>
            ))}
        </ul>
      </div>
      <div>
        <h2>Notificações</h2>
        <ul>
          {eachUser?.requests &&
            eachUser.requests.map((item, index) => (
              <li>
                <img src={item.avatar} alt="Avatar"></img>
                <h1> {item.name}</h1>
                <button onClick={() => acceptFriend(index)}>Aceitar</button>
                <button onClick={() => refuseRequest(index)}>Recusar</button>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <h2>Amigos</h2>
        {eachUser?.friends &&
          eachUser.friends.map((item, index) => (
            <>
              <ul>
                <li>
                  <img src={item.avatar} alt="Avatar"></img>
                  <h1> {item.name}</h1>
                  <Link to="/chat" onClick={() => startChat(index)}>
                    Conversar
                  </Link>
                  <button onClick={() => removeFriend(index)}>Remover</button>
                </li>
              </ul>
            </>
          ))}
      </div>
    </div>
  );
}

export default Profile;
