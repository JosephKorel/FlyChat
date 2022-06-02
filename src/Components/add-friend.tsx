import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import { AppContext, userInterface } from "../Context/AuthContext";
import { auth, db } from "../firebase-config";
import {
  Avatar,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";

function AddFriend() {
  const [searchFriend, setSearchFriend] = useState<string>("");
  const [searchRes, setSearchRes] = useState<userInterface[]>([]);
  const { users, eachUser } = useContext(AppContext);

  useEffect(() => {
    document.body.style.backgroundColor = "#fffff5";
  }, []);

  useEffect(() => {
    const otherUsers = users.filter(
      (item) => item.uid !== auth.currentUser?.uid
    );

    console.log(otherUsers);
    console.log(auth.currentUser?.uid);
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
  return (
    <div className="h-screen w-5/6 m-auto">
      <h1 className="text-2xl font-semibold font-sans mt-8">Procurar amigo</h1>
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
              {eachUser?.sentReq.filter((obj) => obj.uid == item.uid).length ==
              1 ? (
                <h2 className={`${item.name} as`}>Solicitação enviada</h2>
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
    </div>
  );
}

export default AddFriend;
