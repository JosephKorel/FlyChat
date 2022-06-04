import { Avatar, Button, IconButton, Input } from "@chakra-ui/react";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useContext, useState } from "react";
import { BiAddToQueue, BiMinus } from "react-icons/bi";
import { AppContext } from "../Context/AuthContext";
import { auth, db, storage } from "../firebase-config";
import { MdCancel, MdOutlineAdd } from "react-icons/md";
import { AiOutlineUpload } from "react-icons/ai";

function NewGroup() {
  const { users, setUsers, eachUser, setEachUser, setPartner } =
    useContext(AppContext);
  const [title, setTitle] = useState<string>("");
  const [groupImg, setGroupImg] = useState<any | null>(null);
  const [stgId, setStgId] = useState<string>("");
  const [groupUsers, setGroupUsers] = useState<
    { name: string; avatar: string; uid: string }[]
  >([
    {
      name: eachUser?.name!,
      avatar: eachUser?.avatar!,
      uid: eachUser?.uid!,
    },
  ]);

  const addFriend = (index: number) => {
    const friend = eachUser?.friends[index];
    if (groupUsers.filter((item) => item.name == friend?.name).length == 0) {
      setGroupUsers([
        ...groupUsers,
        { name: friend?.name!, avatar: friend?.avatar!, uid: friend?.uid! },
      ]);
    }
  };

  const removeFriend = (index: number) => {
    const friend = eachUser?.friends[index];
    const removedFriend = groupUsers.filter(
      (item) => item.name !== friend?.name
    );
    setGroupUsers(removedFriend);
  };

  const createGroup = async () => {
    let uniqueId = "";
    groupUsers.forEach((item) => (uniqueId += item.uid.slice(0, 3)));
    const storageRef = ref(storage, `groupIcon/${uniqueId}`);

    if (groupUsers.length == 1 || !title) return;

    uploadBytes(storageRef, groupImg).then((res) => console.log("success"));

    getDownloadURL(ref(storage, `groupIcon/${uniqueId}`)).then(async (url) => {
      //Adiciona o grupo em cada usuário
      groupUsers.forEach(async (item) => {
        const groupDoc = doc(db, "eachUser", `${item.uid}`);
        await updateDoc(groupDoc, {
          groupChat: arrayUnion({
            users: groupUsers,
            title: title,
            messages: [],
            background: "./default_svg.png",
            groupIcon: url,
            id: uniqueId,
            at: moment().format(),
          }),
        });
      });
    });
  };

  return (
    <div>
      <h1 className="text-lg font-semibold font-sans">Amigos:</h1>
      <div className="max-h-60 overflow-x-auto">
        {eachUser?.friends.map((user, index) => (
          <div className="flex justify-between mt-2 p-1 shadow-lg bg-[#FDFDFC] rounded-full rounded-l-full border-b border-l border-skyblue">
            <Avatar src={user.avatar} size="sm" />
            <p className="text-base font-sans font-semibold px-10">
              {user.name}
            </p>
            <IconButton
              aria-label="Adicionar ao grupo"
              icon={<MdOutlineAdd size={24} color="white" />}
              bg="blue.500"
              rounded="full"
              size="sm"
              onClick={() => addFriend(index)}
            />
          </div>
        ))}
      </div>
      {groupUsers.length > 1 && (
        <div className="mt-4">
          <h1 className="text-lg font-semibold font-sans">Membros</h1>
          <div className="flex flex-wrap mt-1">
            {groupUsers.slice(1).map((item, index) => (
              <>
                <p className="text-base font-sans">{item.name}</p>
                <IconButton
                  aria-label="remover"
                  icon={<MdCancel size={18} color="#C53030" />}
                  onClick={() => removeFriend(index)}
                  size="xs"
                  bg="none"
                  rounded="full"
                >
                  Remover
                </IconButton>
              </>
            ))}
          </div>
        </div>
      )}
      <div>
        <Input
          className="mt-24"
          rounded="full"
          type="text"
          placeholder="Dê um nome ao grupo"
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            setTitle(e.currentTarget.value)
          }
          value={title}
        ></Input>
        <div className="flex justify-between mt-4">
          <p className="font-sans text-lg font-medium leading-[45px]">
            Qual será a foto do grupo?
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
            onChange={(e) => setGroupImg(e.target.files?.[0])}
          ></input>
        </div>
        <Button onClick={createGroup} colorScheme="messenger" className="mt-5">
          Criar grupo
        </Button>
      </div>
    </div>
  );
}

export default NewGroup;
