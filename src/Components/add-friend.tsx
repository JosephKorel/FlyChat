import {
  arrayUnion,
  doc,
  DocumentData,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import { AppContext, eachUserInt, userInterface } from "../Context/AuthContext";
import { auth, db } from "../firebase-config";
import {
  Avatar,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoMdPersonAdd } from "react-icons/io";
import { BsPlusLg, BsCheckSquareFill } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import moment from "moment";
import { useDocumentData } from "react-firebase-hooks/firestore";

function AddFriend() {
  const [searchFriend, setSearchFriend] = useState<string>("");
  const [searchRes, setSearchRes] = useState<userInterface[]>([]);
  const { users, eachUser, setEachUser } = useContext(AppContext);

  useEffect(() => {
    document.body.style.backgroundColor = "#fffff5";
  }, []);

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
        background: "./default_svg.png",
        id,
        at: moment().format(),
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
        background: "./default_svg.png",
        id,
        at: moment().format(),
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

  return (
    <>
      <div className="inline-block">
        <h1 className="p-2 text-md text-stone-100 rounded-br-lg font-sans font-bold bg-skyblue">
          Adicionar amigos
        </h1>
      </div>
      <div className="h-screen w-5/6 m-auto">
        <h1 className="text-2xl font-semibold font-sans mt-8">
          Procurar amigo
        </h1>
        <InputGroup className="mt-4">
          <Input
            type="text"
            placeholder="Nome"
            value={searchFriend}
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setSearchFriend(e.currentTarget.value)
            }
          ></Input>
          <InputRightElement children={<AiOutlineSearch size={20} />} />
        </InputGroup>
        <div>
          {searchFriend &&
            searchRes.map((item, index) => (
              <div className="flex align-center mt-3">
                <Avatar src={item.avatar} name={item.name} />
                <p
                  className={`${
                    item.name.length > 14
                      ? "text-md leading-6"
                      : "text-xl leading-[45px]"
                  } w-48 font-sans font-semibold px-8 `}
                >
                  {item.name}
                </p>
                {eachUser?.sentReq.filter((obj) => obj.uid == item.uid)
                  .length == 1 ? (
                  <Icon as={BsCheckSquareFill} w={10} h={10} color="blue.500" />
                ) : (
                  <IconButton
                    aria-label="Adicionar"
                    icon={<BsPlusLg color="white" />}
                    onClick={() => addFriend(index)}
                    size="md"
                    bg="#48D6D2"
                    className="mt-1"
                  />
                )}
              </div>
            ))}
        </div>
        {eachUser?.sentReq.length !== 0 && (
          <div className="mt-10 text-2xl font-semibold font-sans">
            <h1>Solicitações enviadas</h1>
            {eachUser?.sentReq.map((user) => (
              <div className="flex align-center mt-4">
                <Avatar src={user.avatar} />
                <p className="text-xl font-sans font-semibold px-10 leading-[45px]">
                  {user.name}
                </p>
              </div>
            ))}
          </div>
        )}
        {eachUser?.requests.length !== 0 && (
          <div className="mt-10 text-2xl font-semibold font-sans">
            <h1>Pedidos de amizade</h1>
            {eachUser?.requests.map((user, index) => (
              <div className="flex align-center justify-between mt-4">
                <Avatar src={user.avatar} />
                <p className="text-xl font-sans font-semibold leading-[45px]">
                  {user.name}
                </p>
                <div className="flex justify-between">
                  <IconButton
                    icon={<IoMdPersonAdd color="white" size={20} />}
                    aria-label="Aceitar"
                    rounded="full"
                    bg="#2A6FDB"
                    onClick={() => acceptFriend(index)}
                  />
                  <IconButton
                    icon={<ImCross color="white" />}
                    className="ml-1"
                    aria-label="Recusar"
                    rounded="full"
                    bg="red.500"
                    onClick={() => refuseRequest(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AddFriend;
