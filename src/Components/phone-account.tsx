import React, { FormEvent, useState, useContext } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  useDeviceLanguage,
} from "firebase/auth";
import {
  doc,
  DocumentData,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { AppContext, userInterface } from "../Context/AuthContext";
import { auth, db, provider, storage } from "../firebase-config";
import { useNavigate } from "react-router";
import { requestOTP, verifyOTP } from "../Login-functions/phone-auth";
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationRes: any;
  }
}

function PhoneAccount() {
  const [isVer, setIsVer] = useState<boolean>(false);
  const [number, setNumber] = useState<string>("");
  const [pswError, setPswError] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<any>(null);
  const [name, setName] = useState<string>("");
  const [disable, setDisable] = useState<boolean>(true);
  const { setIsAuth } = useContext(AppContext);

  auth.useDeviceLanguage();

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

  const setProfile = async () => {
    if (name && avatar) {
      if (avatar == defaultAvatar) {
        await updateProfile(auth.currentUser!, {
          displayName: name,
          photoURL: avatar,
        });

        createUser(name, auth.currentUser?.uid!, avatar);
        submitUser(name, auth.currentUser?.uid!, avatar);

        setIsAuth(true);
      } else {
        const storageRef = ref(storage, `profileImg/${auth.currentUser?.uid}`);
        await uploadBytes(storageRef, avatar).then(() =>
          console.log("success")
        );

        getDownloadURL(ref(storage, `profileImg/${auth.currentUser?.uid}`))
          .then(async (url) => {
            await updateProfile(auth.currentUser!, {
              displayName: name,
              photoURL: url,
            });
            createUser(name, auth.currentUser?.uid!, url);
            submitUser(name, auth.currentUser?.uid!, url);
          })
          .catch((error) => console.log(error));
        setIsAuth(true);
      }

      navigate("/user-chats");
    }
  };

  return (
    <div>
      {isVer ? (
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
          <button onClick={setProfile}>Registrar</button>
        </div>
      ) : (
        <div>
          <form onSubmit={(e) => requestOTP(e, number, setDisable)}>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            ></input>
            <input
              type="text"
              id="create-acc-code"
              onChange={() =>
                verifyOTP("create-acc-code", setIsVer, setProfile, null)
              }
              placeholder="Código"
              disabled={disable}
            ></input>
            <input type="submit" placeholder="Continuar"></input>
            <div id="recaptcha-container"></div>
          </form>
        </div>
      )}
    </div>
  );
}

export default PhoneAccount;
