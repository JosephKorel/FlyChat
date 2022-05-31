import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  DocumentData,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { AppContext, userInterface } from "../Context/AuthContext";
import { auth, db, provider, storage } from "../firebase-config";

function CreateAccount() {
  const { setIsAuth } = useContext(AppContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pswError, setPswError] = useState<boolean>(false);
  const [isReg, setIsReg] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<any>(null);
  const [name, setName] = useState<string>("");
  const input = document.getElementById("psw") as HTMLInputElement;
  let navigate = useNavigate();
  let defaultAvatar = "./default_avatar.png";

  const createUser = async (name: string, userId: string, photo: string) => {
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

  const submitUser = async (name: string, userId: string, photo: string) => {
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
        createUser("", res.user.uid, "");
        submitUser("", res.user.uid, "");
        setIsReg(true);
      })
      .catch((error) => console.log(error));
  };

  const setProfile = async () => {
    if (name && avatar) {
      const docRef = doc(db, "eachUser", `${auth.currentUser?.uid}`);
      const allUsersDoc = doc(db, "allUsers", "list");
      const docData = await getDoc(allUsersDoc);
      const docResult: DocumentData | undefined = docData.data();
      const usersList: userInterface[] = docResult?.users;

      if (avatar == defaultAvatar) {
        usersList.forEach((user) => {
          if (user.uid == auth.currentUser?.uid) {
            user.name = name;
            user.avatar = avatar;
          }
        });

        await updateProfile(auth.currentUser!, {
          displayName: name,
          photoURL: avatar,
        });

        await updateDoc(allUsersDoc, { users: usersList });

        await updateDoc(docRef, { name, avatar });

        setIsAuth(true);
      } else {
        const storageRef = ref(storage, `profileImg/${auth.currentUser?.uid}`);
        await uploadBytes(storageRef, avatar).then(() =>
          console.log("success")
        );

        getDownloadURL(ref(storage, `profileImg/${auth.currentUser?.uid}`))
          .then(async (url) => {
            usersList.forEach((user) => {
              if (user.uid == auth.currentUser?.uid) {
                user.name = name;
                user.avatar = url;
              }
            });

            await updateProfile(auth.currentUser!, {
              displayName: name,
              photoURL: url,
            });

            await updateDoc(docRef, { name, avatar: url });
          })
          .catch((error) => console.log(error));
        setIsAuth(true);
      }

      navigate("/profile");
    }
  };

  return (
    <div>
      {isReg ? (
        <div>
          <label>Nome de usuário</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></input>
          <label>Foto de usuário</label>
          <input
            type="file"
            onChange={(e) => setAvatar(e.target.files?.[0])}
          ></input>
          <button onClick={() => setAvatar(defaultAvatar)}>
            Usar foto automática
          </button>
          <button onClick={setProfile}>Continuar</button>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default CreateAccount;
