import {
  arrayUnion,
  doc,
  DocumentData,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../Context/AuthContext";
import { auth, db } from "../firebase-config";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";

function Profile() {
  const { users, setUsers, eachUser, setEachUser, setPartner } =
    useContext(AppContext);
  const [searchFriend, setSearchFriend] = useState<string>("");
  const [searchRes, setSearchRes] = useState<userInterface[]>([]);

  //Atualização em tempo-real
  const [eachUserDoc] = useDocumentData(
    doc(db, "eachUser", `${auth.currentUser?.uid}`)
  );

  const docUpdate = async () => {
    const userDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const data: DocumentData = await getDoc(userDoc);
    setEachUser(data.data());
  };

  useEffect(() => {
    docUpdate();
  }, [eachUserDoc]);

  interface userInterface {
    name: string;
    avatar: string;
    uid: string;
  }

  interface chatInterface {
    sender: string;
    avatar: string;
    content: string;
    time: string;
  }

  interface eachUserInt {
    avatar: string;
    name: string;
    uid: string;
    friends: userInterface[];
    requests: userInterface[];
    chats: { users: string[]; messages: chatInterface[]; id: number }[];
  }

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
  }, []);

  useEffect(() => {
    const otherUsers = users.filter(
      (item) => item.name !== auth.currentUser?.displayName
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
    const friendDoc = doc(db, "eachUser", `${friendId}`);

    await updateDoc(friendDoc, {
      requests: arrayUnion({
        name: auth.currentUser?.displayName,
        uid: auth.currentUser?.uid,
        avatar: auth.currentUser?.photoURL,
      }),
    });
  };

  const acceptFriend = async (index: number) => {
    const currentUser = auth.currentUser?.displayName;
    const docRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friend: userInterface | undefined = eachUser?.requests[index];
    const friendDoc = doc(db, "eachUser", `${friend?.uid}`);
    const docSnap: DocumentData = await getDoc(docRef);
    const currentDoc = docSnap.data();
    const filteredReq = currentDoc?.requests.filter(
      (item: userInterface) => item.name !== friend?.name
    );
    const id: number = Date.now();
    await updateDoc(docRef, {
      friends: arrayUnion({
        name: friend?.name,
        uid: friend?.uid,
        avatar: friend?.avatar,
      }),
      chats: arrayUnion({
        users: [currentUser, friend?.name],
        messages: [],
        id,
      }),
    });

    await updateDoc(friendDoc, {
      friends: arrayUnion({
        name: auth.currentUser?.displayName,
        uid: auth.currentUser?.uid,
        avatar: auth.currentUser?.photoURL,
      }),
      chats: arrayUnion({
        users: [friend?.name, currentUser],
        messages: [],
        id,
      }),
    });

    await updateDoc(docRef, {
      requests: filteredReq,
    });
  };

  const refuseRequest = async (index: number) => {
    const docRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friend: userInterface | undefined = eachUser?.requests[index];
    const docSnap: DocumentData = await getDoc(docRef);
    const currentDoc = docSnap.data();
    const filteredReq = currentDoc?.requests.filter(
      (item: userInterface) => item.name !== friend?.name
    );

    await updateDoc(docRef, {
      requests: filteredReq,
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
      item.users.includes(friend?.name!)
    );

    const myIndex = currentFrdDoc.chats.findIndex((item) =>
      item.users.includes(auth.currentUser?.displayName!)
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
    const currentUserDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);
    const friend: userInterface | undefined = eachUser?.friends[index];

    setPartner(friend?.name!);
  };

  return (
    <div>
      <div>
        <img src={auth.currentUser?.photoURL || ""} alt="User Avatar"></img>
        <h1>{auth.currentUser?.displayName}</h1>
      </div>
      <div>Adicionar amigos:</div>
      <input
        type="text"
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
                <button onClick={() => addFriend(index)}>Adicionar</button>
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
                  {/*  <button onClick={() => startChat(index)}>Conversar</button> */}
                  <button onClick={() => removeFriend(index)}>Remover</button>
                </li>
              </ul>
              {/*   <input
                type="text"
                placeholder="Digite sua mensagem"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></input>
              <button onClick={() => sendMsg(index)}>Enviar</button> */}
            </>
          ))}
      </div>
    </div>
  );
}

export default Profile;
