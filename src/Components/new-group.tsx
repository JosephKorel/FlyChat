import { Avatar, Button, IconButton, Input } from "@chakra-ui/react";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useContext, useState } from "react";
import { AppContext, eachUserInt, userInterface } from "../Context/AuthContext";
import { db, storage } from "../firebase-config";
import { MdCancel, MdOutlineAdd } from "react-icons/md";
import { AiOutlineUpload } from "react-icons/ai";
import { useNavigate } from "react-router";

function NewGroup() {
  const { eachUser } = useContext(AppContext);
  const [title, setTitle] = useState<string>("");
  const [groupImg, setGroupImg] = useState<any | null>(null);
  const [groupUsers, setGroupUsers] = useState<userInterface[]>([
    {
      name: eachUser!.name,
      avatar: eachUser!.avatar,
      uid: eachUser!.uid,
    },
  ]);
  let navigate = useNavigate();

  const isIn = (index: number): boolean => {
    const friend = eachUser?.friends[index];
    return groupUsers.filter((item) => item.name == friend!.name).length
      ? true
      : false;
  };

  const addFriend = (index: number) => {
    const friend = eachUser?.friends[index];

    if (isIn(index)) {
      const removedFriend = groupUsers.filter(
        (item) => item.name !== friend?.name
      );
      setGroupUsers(removedFriend);
      return;
    }
    setGroupUsers([
      ...groupUsers,
      { name: friend?.name!, avatar: friend?.avatar!, uid: friend?.uid! },
    ]);
  };

  const createGroup = async () => {
    let uniqueId = "";
    groupUsers.forEach((item) => (uniqueId += item.uid.slice(0, 3)));
    const storageRef = ref(storage, `groupIcon/${uniqueId}`);

    if (groupUsers.length == 1 || !title) return;

    try {
      await uploadBytes(storageRef, groupImg);

      const imgURL = await getDownloadURL(
        ref(storage, `groupIcon/${uniqueId}`)
      );

      groupUsers.forEach(async (item) => {
        const groupDoc = doc(db, "eachUser", `${item.uid}`);
        await updateDoc(groupDoc, {
          groupChat: arrayUnion({
            users: groupUsers,
            title: title,
            messages: [],
            background: "./default_svg.png",
            groupIcon: imgURL,
            id: uniqueId,
            at: moment().format(),
          }),
        });
      });

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="font-sans bg-dark-400 p-2 rounded-md"
      onClick={(e) => e.stopPropagation()}
    >
      <h1 className="text-2xl text-gray-100">{title ? title : "Novo grupo"}</h1>
      <input
        className="mt-2 rounded-md w-full py-1 px-3 outline-none text-dark border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
        placeholder="Dê um nome ao grupo"
        onChange={(e) => setTitle(e.currentTarget.value)}
        value={title}
      />
      <div className="flex items-center gap-2">
        {eachUser?.friends.map((user, index) => (
          <button
            key={index}
            onClick={() => addFriend(index)}
            className={`w-fit mt-2 rounded-md border duration-200 py-1 px-2 ${
              isIn(index)
                ? "border-transparent bg-lime text-dark font-semibold"
                : "border-lime text-gray-100"
            }`}
          >
            <p className="text-xs uppercase">{user.name}</p>
          </button>
        ))}
      </div>
      <div>
        <div className="flex items-center gap-4 mt-4">
          <p className="text-gray-100">Qual será a foto do grupo?</p>
          <button
            onClick={() => {
              document.getElementById("group-img")?.click();
            }}
            className="p-1 bg-lime text-dark rounded-full"
          >
            <AiOutlineUpload />
          </button>
          <input
            className="hidden"
            type="file"
            id="group-img"
            onChange={(e) => setGroupImg(e.target.files?.[0])}
          ></input>
        </div>
        {groupImg !== null ? <p>{groupImg.name}</p> : <></>}
        <button
          onClick={createGroup}
          className="mt-5 bg-lime font-semibold text-sm rounded-md py-1 px-3 text-dark"
        >
          CRIAR GRUPO
        </button>
      </div>
    </div>
  );
}

export default NewGroup;
