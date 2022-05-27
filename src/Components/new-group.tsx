import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { AppContext } from "../Context/AuthContext";
import { auth, db } from "../firebase-config";

function NewGroup() {
  const { users, setUsers, eachUser, setEachUser, setPartner } =
    useContext(AppContext);
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
    const id = Date.now();
    const myDoc = doc(db, "eachUser", `${auth.currentUser?.uid}`);

    if (groupUsers.length == 1) return;

    //Adiciona o grupo no usuário atual
    await updateDoc(myDoc, {
      groupChat: arrayUnion({ users: groupUsers, messages: [], id }),
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
        <button onClick={createGroup}>Criar grupo</button>
      </div>
    </div>
  );
}

export default NewGroup;
