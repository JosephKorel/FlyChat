import { createContext, ReactNode, useState } from "react";
import useLocalStorage from "../local-storage";

interface usersList {
  name: string;
  avatar: string;
  uid: string;
}

interface userInterface {
  name: string;
  avatar: string;
  uid: string;
}

interface chatInterface {
  sender: string;
  avatar: string;
  content: string;
  time: string;
}

interface eachUserInt {
  avatar: string;
  name: string;
  uid: string;
  friends: userInterface[];
  requests: userInterface[];
  sentReq: string[];
  chats: { users: string[]; messages: chatInterface[]; id: number }[];
}

type Props = {
  children: ReactNode;
};

type AppContextType = {
  isAuth: boolean;
  setIsAuth: (newState: boolean) => void;
  users: usersList[];
  setUsers: (newState: usersList[]) => void;
  eachUser: eachUserInt | null;
  setEachUser: (newState: eachUserInt) => void;
  partner: string | undefined;
  setPartner: (newState: string) => void;
};

const InitialValue = {
  isAuth: false,
  setIsAuth: () => {},
  users: [],
  setUsers: () => {},
  eachUser: null,
  setEachUser: () => {},
  partner: undefined,
  setPartner: () => {},
};

export const AppContext = createContext<AppContextType>(InitialValue);

export const AppContextProvider = ({ children }: Props) => {
  const [isAuth, setIsAuth] = useLocalStorage("isAuth", InitialValue.isAuth);
  const [users, setUsers] = useState<usersList[]>([]);
  const [eachUser, setEachUser] = useState<eachUserInt | null>(null);
  const [partner, setPartner] = useState<string | undefined>(undefined);
  return (
    <AppContext.Provider
      value={{
        isAuth,
        setIsAuth,
        users,
        setUsers,
        eachUser,
        setEachUser,
        partner,
        setPartner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
