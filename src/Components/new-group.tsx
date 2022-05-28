import {
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useContext, useState } from "react";
import { AppContext } from "../Context/AuthContext";
import { auth, db, storage } from "../firebase-config";

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
    console.log(moment().format());
  };

  const removeFriend = (index: number) => {
    const friend = eachUser?.friends[index];
    const removedFriend = groupUsers.filter(
      (item) => item.name !== friend?.name
    );
    setGroupUsers(removedFriend);
  };

  const createGroup = async () => {
    const id = Date.now();
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
            background: "/a.png",
            groupIcon: url,
            id,
            at: moment().format(),
          }),
        });
      });
    });
  };

  return (
    <div>
      <h1>Amigos:</h1>
      <ul>
        {eachUser?.friends.map((item, index) => (
          <li>
            <img src={item.avatar} alt="Avatar"></img>
            {item.name}
            <button onClick={() => addFriend(index)}>Selecionar</button>
          </li>
        ))}
      </ul>
      <div>
        <ul>
          {groupUsers.length > 1 &&
            groupUsers.slice(1).map((item, index) => (
              <li>
                {item.name}
                <button onClick={() => removeFriend(index)}>Remover</button>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <input
          type="text"
          placeholder="Nome do grupo"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        ></input>
        <input
          type="file"
          onChange={(e) => setGroupImg(e.target.files?.[0])}
        ></input>
        <button onClick={createGroup}>Criar grupo</button>
      </div>
    </div>
  );
}

export default NewGroup;
