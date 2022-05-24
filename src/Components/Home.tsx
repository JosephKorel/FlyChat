import { signInWithPopup, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { userInfo } from "os";
import React, { FC, useContext, useEffect } from "react";
import { AppContext } from "../Context/AuthContext";
import { auth, provider, db } from "../firebase-config";

const Home: FC = () => {
  const { isAuth, setIsAuth } = useContext(AppContext);

  //Cria um doc do usuário
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
      chats: [],
    });
  };

  //Adiciona o usuário na lista de todos usuários
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

  useEffect(() => {}, []);

  const googleSignIn = () => {
    signInWithPopup(auth, provider).then((res) => {
      setIsAuth(true);
      if (auth.currentUser) {
        submitUser(
          auth.currentUser.displayName,
          auth.currentUser.uid,
          auth.currentUser.photoURL
        );
        createUser(
          auth.currentUser.displayName,
          auth.currentUser.uid,
          auth.currentUser.photoURL
        );
      }
    });
  };

  const logOut = () => {
    signOut(auth).then(() => {
      setIsAuth(false);
    });
  };

  return (
    <nav>
      <button onClick={googleSignIn}>Entrar com o Google</button>
      {isAuth && (
        <>
          <button onClick={logOut}>Sair</button>
          <img src={auth.currentUser?.photoURL || ""} alt="User Avatar"></img>
        </>
      )}
    </nav>
  );
};

export default Home;
