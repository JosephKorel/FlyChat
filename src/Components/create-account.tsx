import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, DocumentData, getDoc, setDoc } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { AppContext } from "../Context/AuthContext";
import { auth, db, provider } from "../firebase-config";

function CreateAccount() {
  const { setEachUser, setIsAuth } = useContext(AppContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pswError, setPswError] = useState<boolean>(false);
  const input = document.getElementById("psw") as HTMLInputElement;
  let navigate = useNavigate();

  const createUser = async (
    name: string | undefined | null,
    userId: string | undefined,
    photo: string | undefined | null
  ) => {
    const docRef = doc(db, "eachUser", `${userId}`);
    const docSnap = await getDoc(docRef);

    //Checa se o usuário já é cadastrado
    if (docSnap.exists()) return;

    await setDoc(doc(db, "eachUser", `${userId}`), {
      name,
      avatar: photo,
      uid: userId,
      friends: [],
      requests: [],
      sentReq: [],
      chats: [],
      groupChat: [],
    });
  };

  const submitUser = async (
    name: string | undefined | null,
    userId: string | undefined,
    photo: string | undefined | null
  ) => {
    const snapshot: DocumentData = await getDoc(doc(db, "allUsers", "list"));
    const currentUsers: { name: string; uid: string; photo: string }[] =
      snapshot.data().users;

    if (currentUsers.some((item) => item.uid == auth.currentUser?.uid)) return;
    else {
      await setDoc(doc(db, "allUsers", "list"), {
        users: [...currentUsers, { name, uid: userId, avatar: photo }],
      });
      console.log("success");
    }
  };

  const createAccount = () => {
    if (!email || !password) return;

    if (input.value !== password) {
      setPswError(true);
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((res) => {
        createUser(res.user.displayName, res.user.uid, res.user.photoURL);
        submitUser(res.user.displayName, res.user.uid, res.user.photoURL);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></input>
      <input type="password" placeholder="Senha" id="psw"></input>
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setPswError(false);
        }}
      ></input>
      {pswError && <p>As senhas precisam ser iguais</p>}
      <button onClick={createAccount}>Criar conta</button>
      <br></br>
      <button onClick={() => navigate("/phone-account")}>
        Criar conta com número de celular
      </button>
    </div>
  );
}

export default CreateAccount;
