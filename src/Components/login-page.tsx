import { Button, Input, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, DocumentData, getDoc, setDoc } from "firebase/firestore";
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AppContext } from "../Context/AuthContext";
import { auth, db, provider } from "../firebase-config";
import { requestOTP, verifyOTP } from "../Login-functions/phone-auth";
import { FcGoogle, FcPhoneAndroid } from "react-icons/fc";
import { RiLoginBoxLine } from "react-icons/ri";

function Login() {
  const { setIsAuth, setEachUser } = useContext(AppContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneLogin, setPhoneLogin] = useState(false);
  const [number, setNumber] = useState<string>("");
  const [disable, setDisable] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
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
      chatBg: "./default_svg.png",
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
        navigate("/");
      })
      .catch((error) => console.log(error));
  };

  const googleSignIn = () => {
    signInWithPopup(auth, provider).then(async (res) => {
      createUser(res.user.displayName, res.user.uid, res.user.photoURL);
      submitUser(res.user.displayName, res.user.uid, res.user.photoURL);

      const docRef = doc(db, "eachUser", res.user.uid);
      const docSnap: DocumentData = await getDoc(docRef);
      setEachUser(docSnap.data());
      setIsAuth(true);
      navigate("/");
    });
  };

  return (
    <div>
      {phoneLogin ? (
        <div className="flex flex-col align-center flex-1">
          <form
            onSubmit={(e) => {
              requestOTP(e, number, setDisable);
              setSuccess(true);
            }}
            className="w-5/6 m-auto mt-4"
            id="phone-form"
          >
            <InputGroup className="mt-4">
              <InputLeftAddon children="+55" />
              <Input
                placeholder="Número de telefone"
                type="text"
                value={number}
                background="white"
                _focus={{ bg: "white" }}
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  setNumber(e.currentTarget.value)
                }
              ></Input>
            </InputGroup>
            <p className={success ? "py-2 text-sm text-stone-900" : "hidden"}>
              Você receberá um SMS com um código de verificação.
            </p>
            <Input
              type="text"
              className="mt-4"
              id="code"
              onChange={() => {
                verifyOTP("code", null, null, setIsAuth);
                navigate("/profile");
              }}
              background="white"
              _focus={{ bg: "white" }}
              placeholder="Código de segurança"
              disabled={disable}
            ></Input>
            <Button
              className="m-auto mt-4 w-full"
              colorScheme="messenger"
              type="submit"
            >
              Enviar código de segurança
            </Button>
            <div id="recaptcha-container"></div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-col">
            <div className="w-5/6 m-auto mt-4">
              <Input
                className="mt-4"
                type="text"
                placeholder="Email"
                background="white"
                _focus={{ bg: "white" }}
                value={email}
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  setEmail(e.currentTarget.value)
                }
              ></Input>
              <Input
                className=" mt-4"
                type="password"
                placeholder="Senha"
                background="white"
                _focus={{ bg: "white" }}
                value={password}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setPassword(e.currentTarget.value);
                }}
              ></Input>
            </div>
            <Button
              className="m-auto mt-4 w-5/6"
              leftIcon={<RiLoginBoxLine />}
              onClick={signIn}
              colorScheme="messenger"
            >
              Entrar
            </Button>
            <Button
              className="m-auto mt-4 w-5/6"
              leftIcon={<FcGoogle />}
              onClick={googleSignIn}
              colorScheme="gray"
            >
              Continuar com o Google
            </Button>
            <Button
              className="m-auto mt-4 w-5/6"
              leftIcon={<FcPhoneAndroid />}
              onClick={(e: EventInit) => setPhoneLogin(true)}
              colorScheme="gray"
            >
              Entrar com celular
            </Button>
          </div>
          <div className="flex align-center justify-center mt-4 w-5/6 m-auto">
            <div className="flex-grow flex flex-col align-center justify-center">
              <div className="border border-stone-800  h-0"></div>
            </div>
            <p className="px-4">OU</p>
            <div className="flex-grow flex flex-col align-center justify-center">
              <div className="border border-stone-800  h-0"></div>
            </div>
          </div>
          <Button
            className="m-auto mt-4 w-5/6"
            onClick={() => navigate("/create-account")}
            colorScheme="messenger"
          >
            Criar conta
          </Button>
        </div>
      )}
    </div>
  );
}

export default Login;
