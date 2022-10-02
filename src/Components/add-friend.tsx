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
import { Avatar } from "@chakra-ui/react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoMdPersonAdd } from "react-icons/io";
import { BsPlusLg, BsCheckLg } from "react-icons/bs";
import moment from "moment";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { TiCancel } from "react-icons/ti";

function AddFriend() {
  const [search, setSearch] = useState("");
  const { users, eachUser, setEachUser, isMobile } = useContext(AppContext);

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

  const otherUsers = users.filter((item) => item.uid !== auth.currentUser?.uid);
  const notFriends = otherUsers.filter((item) => {
    const isFriend = eachUser!.friends.filter(
      (friend) => friend.uid == item.uid
    );
    return !isFriend.length ? true : false;
  });

  const searchResult = search.length
    ? notFriends.filter((friend) =>
        friend.name.toLowerCase().includes(search.toLowerCase())
      )
    : notFriends;

  const hasSentRequest = (uid: string): boolean => {
    const filter = eachUser!.sentReq.filter((obj) => obj.uid == uid);
    return filter.length ? true : false;
  };

  const addFriend = async (index: number): Promise<void> => {
    const friend = searchResult[index];
    const myDoc = doc(db, "eachUser", `${auth.currentUser!.uid}`);
    const friendDoc = doc(db, "eachUser", `${friend.uid}`);

    await updateDoc(friendDoc, {
      requests: arrayUnion({
        name: auth.currentUser!.displayName,
        uid: auth.currentUser!.uid,
        avatar: auth.currentUser!.photoURL,
      }),
    });
    await updateDoc(myDoc, {
      sentReq: arrayUnion({
        name: friend.name,
        avatar: friend.avatar,
        uid: friend.uid,
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
    const at = Date.now();

    const filteredReq = currentDoc?.requests.filter(
      (item: userInterface) => item.uid !== friend?.uid
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
            name: eachUser!.name,
            avatar: eachUser!.avatar,
            uid: eachUser!.uid,
          },
          { name: friend!.name, avatar: friend!.avatar, uid: friend!.uid },
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
        at,
      }),
    });

    !isMobile && document.location.reload();
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
      <div className="w-full p-4 sm:w-2/3 lg:w-[95%] m-auto pt-4 h-screen lg:h-[90vh] overflow-auto text-stone-100 bg-dark font-sans">
        <h1 className="text-2xl font-semibold font-sans mt-8">
          Procurar amigo
        </h1>
        <div className="mt-4 flex items-center p-2 gap-1 bg-white rounded-md text-stone-800 border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none">
          <AiOutlineSearch className="text-2xl" />
          <input
            className="w-full outline-none text-dark border border-transparent hover:border-lime focus:border-transparent focus:ring-transparent focus:outline-none"
            placeholder="Nome"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
        <div className="max-h-[50vh] overflow-auto">
          {search &&
            searchResult.map((item, index) => (
              <>
                <div
                  key={index}
                  className="flex items-center justify-between mt-3"
                >
                  <Avatar src={item.avatar} name={item.name} />
                  <p
                    className={`${
                      item.name.length > 14 ? "text-md" : "text-lg"
                    }  font-semibold px-8 whitespace-nowrap`}
                  >
                    {item.name}
                  </p>
                  {hasSentRequest(item.uid) ? (
                    <div className="p-2 text-lime rounded-md">
                      <BsCheckLg className="text-xl" />
                    </div>
                  ) : (
                    <button
                      onClick={() => addFriend(index)}
                      className="p-2 rounded-md bg-gradient-to-b from-lime-300 to-lime-600"
                    >
                      <BsPlusLg className="text-dark text-xl" />
                    </button>
                  )}
                </div>
              </>
            ))}
        </div>
        {eachUser!.sentReq.length > 0 && (
          <div className="mt-10 text-2xl font-semibold font-sans">
            <h1>Solicitações enviadas</h1>
            {eachUser?.sentReq.map((user) => (
              <div className="flex align-center mt-4">
                <Avatar src={user.avatar} />
                <p className="text-lg font-sans font-semibold px-10 leading-[45px]">
                  {user.name}
                </p>
              </div>
            ))}
          </div>
        )}
        {eachUser!.requests.length > 0 && (
          <div className="mt-10">
            <h1 className="text-2xl font-semibold">Pedidos de amizade</h1>
            {eachUser?.requests.map((user, index) => (
              <div className="flex items-center justify-between mt-4">
                <Avatar src={user.avatar} />
                <p className="text-xl font-semibold">{user.name}</p>
                <div className="flex items-center gap-4">
                  <button
                    className="p-1 rounded-md bg-lime"
                    onClick={() => acceptFriend(index)}
                  >
                    <IoMdPersonAdd className="text-dark text-xl" />
                  </button>
                  <button
                    onClick={() => refuseRequest(index)}
                    className="p-1 rounded-md bg-red-500"
                  >
                    <TiCancel className="text-xl text-white" />
                  </button>
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
