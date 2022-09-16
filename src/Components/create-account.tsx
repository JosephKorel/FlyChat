import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useContext, useState, useEffect } from "react";
import { AiOutlineUpload } from "react-icons/ai";
import { useNavigate } from "react-router";
import { AppContext } from "../Context/AuthContext";
import { auth, db, storage } from "../firebase-config";
import Alert from "../Styled-components/alert";

function CreateAccount() {
  const { setIsAuth, isMobile } = useContext(AppContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const [isReg, setIsReg] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<any>(null);
  const [name, setName] = useState<string>("");
  const [msg, setMsg] = useState("");
  const input = document.getElementById("psw") as HTMLInputElement;
  let navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setMsg("");
      setError("");
    }, 2500);
  }, [msg, error]);

  const createUser = async (
    name: string,
    userId: string,
    photo: string
  ): Promise<void | null> => {
    const docRef = doc(db, "eachUser", `${userId}`);
    const docSnap = await getDoc(docRef);

    //Checa se o usuário já é cadastrado
    if (docSnap.exists()) {
      setError("Usuário já registrado");
      return null;
    }

    //Cria o documento separado do usuário
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

  const createAccount = async (): Promise<void | null> => {
    if (!email || !password) return null;

    if (input.value !== password) {
      setError("As senhas devem ser iguais");
      return null;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsReg(true);
    } catch (error) {
      setError("Houve algum erro, tente novamente");
    }

    /* createUserWithEmailAndPassword(auth, email, password)
      .then((res) => {
        setIsReg(true);
      })
      .catch((error) => console.log(error)); */
  };

  const setProfile = async (): Promise<void | null> => {
    if (name.length < 4) {
      setError("Seu nome precisa ter pelo menos 4 caracteres");
      return null;
    }

    if (avatar == null) {
      await updateProfile(auth.currentUser!, {
        displayName: name,
        photoURL: "",
      });

      createUser(name, auth.currentUser?.uid!, "");
      /*  submitUser(name, auth.currentUser?.uid!, ""); */

      setIsAuth(true);
    } else {
      const storageRef = ref(storage, `profileImg/${auth.currentUser?.uid}`);

      try {
        await uploadBytes(storageRef, avatar);
        const url = await getDownloadURL(
          ref(storage, `profileImg/${auth.currentUser!.uid}`)
        );

        await updateProfile(auth.currentUser!, {
          displayName: name,
          photoURL: url,
        });

        createUser(name, auth.currentUser?.uid!, url);
        setIsAuth(true);
      } catch (error) {
        setError("Houve algum erro, tente novamente");
      }
    }

    isMobile ? navigate("/profile") : navigate("/");
  };

  return (
    <div className="bg-dark p-2 h-screen overflow-hidden relative">
      {msg || error ? <Alert msg={msg} error={error} /> : <></>}
      {isReg ? (
        <div className="flex flex-col w-11/12 lg:w-1/2 m-auto">
          <div className="mt-4">
            <label className="font-sans font-medium text-gray-200">
              Como você gostaria de ser chamado(a)?
            </label>
            <input
              className="mt-2 rounded-md w-full py-2 px-3 outline-none text-dark border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <button
              className="mt-4 w-full flex justify-center items-center gap-2 rounded-md bg-lime font-semibold text-dark py-2 px-3"
              onClick={() => {
                document.getElementById("avatar-input")?.click();
              }}
            >
              <p>SELECIONAR FOTO DE PERFIL</p>
              <AiOutlineUpload size={20} />
            </button>
            <input
              className="hidden"
              type="file"
              id="avatar-input"
              onChange={(e) => setAvatar(e.target.files?.[0])}
            ></input>
          </div>
          {avatar != null ? (
            <div className="flex flex-col gap-4 mt-1">
              <p className="text-gray-200 font-semibold">{avatar?.name}</p>
              <button
                className="w-full rounded-md bg-lime font-semibold text-dark py-2 px-3"
                onClick={setProfile}
              >
                CONTINUAR
              </button>
            </div>
          ) : (
            <button
              className="mt-4 w-full rounded-md bg-gray-200 font-semibold text-dark py-2 px-3"
              onClick={setProfile}
            >
              TALVEZ MAIS TARDE
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col w-11/12 lg:w-1/2 m-auto">
          <div className="text-center">
            <input
              className="mt-4 rounded-md w-full py-2 px-3 outline-none text-dark border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              id="psw"
              className="mt-4 rounded-md w-full py-2 px-3 outline-none text-dark border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
            ></input>
            <input
              className="mt-4 rounded-md w-full py-2 px-3 outline-none text-dark border border-transparent hover:border-lime focus:border-lime focus:ring-lime focus:outline-none"
              type="password"
              placeholder="Digite a senha novamente"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
          </div>
          <button
            className="mt-4 rounded-md bg-lime font-semibold text-dark py-2 px-3"
            onClick={createAccount}
          >
            CONTINUAR
          </button>
          {/* <div className="flex align-center justify-center mt-4 w-full m-auto">
            <div className="flex-grow flex flex-col align-center justify-center">
              <div className="border border-stone-800  h-0"></div>
            </div>
            <p className="px-4">OU</p>
            <div className="flex-grow flex flex-col align-center justify-center">
              <div className="border border-stone-800  h-0"></div>
            </div>
          </div>
           <Button
            className="m-auto mt-4 w-5/6 lg:w-full"
            leftIcon={<FcPhoneAndroid />}
            onClick={() => navigate("/phone-account")}
            colorScheme="gray"
          >
            Criar conta com número de celular
          </Button> */}
        </div>
      )}
    </div>
  );
}

export default CreateAccount;
