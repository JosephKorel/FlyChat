import { Button, Input, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import {
  arrayUnion,
  doc,
  DocumentData,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AppContext } from "../Context/AuthContext";
import { auth, db, provider } from "../firebase-config";
import { requestOTP, verifyOTP } from "../Login-functions/phone-auth";
import { FcGoogle } from "react-icons/fc";
import { RiLoginBoxLine } from "react-icons/ri";
import Alert from "../Styled-components/alert";

function Login() {
  const { setIsAuth, isMobile } = useContext(AppContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneLogin, setPhoneLogin] = useState(false);
  const [number, setNumber] = useState<string>("");
  const [disable, setDisable] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState("");
  let navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 2500);
  }, [error]);

  const isRegistered = async (userId: string): Promise<boolean> => {
    const docRef = doc(db, "eachUser", `${userId}`);
    const docSnap = await getDoc(docRef);

    return docSnap.exists() ? true : false;
  };

  const createUser = async (
    name: string | undefined | null,
    userId: string | undefined,
    photo: string | undefined | null
  ): Promise<void | null> => {
    //Checa se o usuário já é cadastrado
    const registered = await isRegistered(userId!);
    if (registered) {
      return null;
    }

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

    await updateDoc(doc(db, "allUsers", "list"), {
      users: arrayUnion({ name, uid: userId, avatar: photo }),
    });
  };

  const signIn = async (): Promise<void | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuth(true);
      isMobile ? navigate("/profile") : navigate("/");
    } catch (error) {
      setError("Houve algum erro, tente novamente");
    }
  };

  const googleSignIn = async (): Promise<void | null> => {
    try {
      const user = await signInWithPopup(auth, provider);
      const registered = await isRegistered(user.user.uid);
      if (registered) {
        setIsAuth(true);
        isMobile ? navigate("/profile") : navigate("/");
      } else {
        await createUser(
          user.user.displayName,
          user.user.uid,
          user.user.photoURL
        );
        setIsAuth(true);
        isMobile ? navigate("/profile") : navigate("/");
      }
    } catch (error) {
      setError("Houve algum erro, tente novamente");
    }
  };

  return (
    <div className="px-2 bg-dark h-screen relative overflow-hidden flex flex-col justify-center items-center">
      {error && <Alert error={error} />}
      {phoneLogin ? (
        <div className="flex flex-col w-5/6 lg:w-1/2 m-auto align-center flex-1">
          <form
            onSubmit={(e) => {
              requestOTP(e, number, setDisable);
              setSuccess(true);
            }}
            className="mt-4"
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
                verifyOTP("code", null, null, setIsAuth, navigate);
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
        <div className="flex flex-col p-2 rounded-md border border-lime font-sans">
          <div className="flex flex-col justify-between items-center gap-5">
            <h1 className="font-dancing text-center font-light text-5xl text-gray-100">
              fly
              <span className="font-title font-bold text-6xl drop-shadow-xl shadow-gray-100 text-lime">
                CHAT
              </span>
              <span className="font-sans font-bold text-5xl text-lime">.</span>
            </h1>
            <p className="font-sans text-gray-200">ENTRE E CONVERSE UM POUCO</p>
          </div>
          <div className="flex flex-col w-11/12 lg:w-1/2 m-auto">
            <div className="mt-4">
              <input
                className="mt-4 rounded-md w-full py-2 px-3 outline-none text-dark border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
              <input
                className="mt-4 rounded-md w-full py-2 px-3 outline-none text-dark border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.currentTarget.value);
                }}
              />
            </div>
            <button
              className="mt-4 flex justify-center items-center gap-2 rounded-md bg-lime font-semibold text-dark py-2 px-3"
              onClick={signIn}
            >
              <RiLoginBoxLine />
              <p>ENTRAR</p>
            </button>
            <button
              className="mt-4 flex justify-center items-center gap-2 rounded-md bg-gray-200 font-semibold text-dark py-2 px-3"
              onClick={googleSignIn}
            >
              <FcGoogle />
              <p className="">CONTINUAR COM O GOOGLE</p>
            </button>
          </div>
          <div className="flex align-center justify-center mt-4 w-5/6 lg:w-1/2 m-auto">
            <div className="flex-grow flex flex-col align-center justify-center">
              <div className="border border-lime-400 h-0"></div>
            </div>
            <p className="px-4 text-gray-200">OU</p>
            <div className="flex-grow flex flex-col align-center justify-center">
              <div className="border border-lime-400 h-0"></div>
            </div>
          </div>
          <button
            className="mt-4 rounded-md bg-lime font-semibold text-dark py-2 px-3"
            onClick={() => navigate("/create-account")}
          >
            CRIAR CONTA
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
