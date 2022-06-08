import { Button, IconButton, Input } from "@chakra-ui/react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, DocumentData, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useContext, useState } from "react";
import { FcPhoneAndroid } from "react-icons/fc";
import { AiOutlineUpload } from "react-icons/ai";
import { useNavigate } from "react-router";
import { AppContext, userInterface } from "../Context/AuthContext";
import { auth, db, storage } from "../firebase-config";

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
      chatBg: "./default_svg.png",
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

      navigate("/");
    }
  };

  return (
    <div>
      {isReg ? (
        <div className="flex flex-col">
          <div className="w-5/6 m-auto mt-4">
            <label className="font-sans text-lg font-medium">Nome</label>
            <Input
              className="mt-1"
              type="text"
              background="white"
              _focus={{ bg: "white" }}
              value={name}
              onChange={(e: React.FormEvent<HTMLInputElement>) =>
                setName(e.currentTarget.value)
              }
            ></Input>
            <div className="flex justify-around mt-4">
              <p className="font-sans text-lg font-medium leading-[45px]">
                Selecione uma foto de perfil
              </p>
              <IconButton
                icon={<AiOutlineUpload />}
                aria-label="Search database"
                rounded="50%"
                size="lg"
                colorScheme="messenger"
                onClick={() => {
                  document.getElementById("avatar-input")?.click();
                }}
              />
            </div>
            <input
              className="hidden"
              type="file"
              id="avatar-input"
              onChange={(e) => setAvatar(e.target.files?.[0])}
            ></input>
          </div>
          {avatar != null ? (
            <>
              <p className="w-5/6 m-auto">{avatar?.name}</p>
              <Button
                className="m-auto mt-8 w-5/6"
                onClick={setProfile}
                colorScheme="messenger"
              >
                Continuar
              </Button>
            </>
          ) : (
            <Button
              className="m-auto mt-4 w-5/6"
              colorScheme="messenger"
              onClick={() => {
                setAvatar(defaultAvatar);
                setProfile();
              }}
            >
              Talvez mais tarde
            </Button>
          )}
          <button onClick={() => setAvatar(defaultAvatar)}>
            Usar foto automática
          </button>
          <button onClick={setProfile}>Continuar</button>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="text-center w-5/6 m-auto">
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
              type="password"
              placeholder="Senha"
              id="psw"
              className="mt-4"
              background="white"
              _focus={{ bg: "white" }}
            ></Input>
            <Input
              className="mt-4"
              type="password"
              placeholder="Digite a senha novamente"
              value={password}
              isInvalid={pswError}
              background="white"
              _focus={{ bg: "white" }}
              onChange={(e: React.FormEvent<HTMLInputElement>) => {
                setPassword(e.currentTarget.value);
                setPswError(false);
              }}
            ></Input>
          </div>
          {pswError && (
            <p className="text-center pt-1">As senhas precisam ser iguais</p>
          )}
          <Button
            className="m-auto mt-4 w-5/6"
            onClick={createAccount}
            colorScheme="messenger"
          >
            Criar conta
          </Button>
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
            leftIcon={<FcPhoneAndroid />}
            onClick={() => navigate("/phone-account")}
            colorScheme="gray"
          >
            Criar conta com número de celular
          </Button>
        </div>
      )}
    </div>
  );
}

export default CreateAccount;
