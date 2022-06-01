import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, DocumentData, getDoc, setDoc } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { AppContext } from "../Context/AuthContext";
import { auth, db, provider } from "../firebase-config";
import { requestOTP, verifyOTP } from "../Login-functions/phone-auth";

function Login() {
  const { setIsAuth } = useContext(AppContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneLogin, setPhoneLogin] = useState(false);
  const [number, setNumber] = useState<string>("");
  const [disable, setDisable] = useState<boolean>(true);
  const [isVer, setIsVer] = useState<boolean>(false);
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

  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setIsAuth(true);
        navigate("/profile");
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
      {phoneLogin ? (
        <div>
          <form onSubmit={(e) => requestOTP(e, number, setDisable)}>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            ></input>
            <input
              type="text"
              id="code"
              onChange={() => verifyOTP("code", null, null, setIsAuth)}
              placeholder="Código"
              disabled={disable}
            ></input>
            <input type="submit" placeholder="Continuar"></input>
            <div id="recaptcha-container"></div>
          </form>
        </div>
      ) : (
        <div className="bg-water-300">
          <div className="flex flex-col align-end">
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
            <button onClick={signIn}>Entrar</button>
            <button onClick={googleSignIn}>Entrar com o Google</button>
            <button onClick={(e) => setPhoneLogin(true)}>
              Entrar com celular
            </button>
          </div>
          <br></br>
          <h1>Ainda não tem uma conta?</h1>
          <button onClick={() => navigate("/create-account")}>
            Criar conta
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
