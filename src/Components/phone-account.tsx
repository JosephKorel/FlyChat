import React, { useState, useContext } from "react";
import { updateProfile } from "firebase/auth";
import { doc, DocumentData, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { AppContext } from "../Context/AuthContext";
import { auth, db, storage } from "../firebase-config";
import { useNavigate } from "react-router";
import { requestOTP, verifyOTP } from "../Login-functions/phone-auth";
import {
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { AiOutlineUpload } from "react-icons/ai";
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
  const [success, setSuccess] = useState<boolean>(false);
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

      navigate("/");
    }
  };

  return (
    <div>
      {isVer ? (
        <>
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
                    document.getElementById("phoneacc-avatar")?.click();
                  }}
                />
              </div>
              <input
                className="hidden"
                type="file"
                id="phoneacc-avatar"
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
          </div>
        </>
      ) : (
        <>
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
                id="create-acc-code"
                onChange={() => {
                  verifyOTP("create-acc-code", setIsVer, null, null);
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
                disabled={success}
              >
                Enviar código de segurança
              </Button>
              <div id="recaptcha-container"></div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default PhoneAccount;
