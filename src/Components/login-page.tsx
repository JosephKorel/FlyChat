import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, DocumentData, getDoc, setDoc } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { AppContext } from "../Context/AuthContext";
import { auth, db, provider } from "../firebase-config";

function Login() {
  const { setIsAuth } = useContext(AppContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
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

    createUserWithEmailAndPassword(auth, email, password)
      .then((res) => {
        createUser(res.user.displayName, res.user.uid, res.user.photoURL);
        submitUser(res.user.displayName, res.user.uid, res.user.photoURL);
      })
      .catch((error) => console.log(error));
  };

  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setIsAuth(true);
      })
      .catch((error) => console.log(error));
  };

  const googleSignIn = () => {
    signInWithPopup(auth, provider).then((res) => {
      createUser(res.user.displayName, res.user.uid, res.user.photoURL);
      submitUser(res.user.displayName, res.user.uid, res.user.photoURL);
      setIsAuth(true);
    });
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></input>
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      ></input>
      <button onClick={signIn}>Entrar com o Google</button>
      <button onClick={googleSignIn}>Entrar com o Google</button>
      <button>Entrar com número de celular</button>
      <br></br>
      <h1>Ainda não tem uma conta?</h1>
      <button onClick={() => navigate("/create-account")}>Criar conta</button>
    </div>
  );
}

export default Login;
