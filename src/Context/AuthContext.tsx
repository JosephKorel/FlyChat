import { createContext, ReactNode, useState } from "react";
import useLocalStorage from "../local-storage";

export interface usersList {
  name: string;
  avatar: string;
  uid: string;
}

export interface userInterface {
  name: string;
  avatar: string;
  uid: string;
}

export interface chatInterface {
  sender: string;
  avatar: string;
  senderuid: string;
  content: string;
  time: string;
}

export interface groupChatInt {
  users: userInterface[];
  title: string;
  messages: {
    sender: string;
    senderuid: string;
    content: string;
    time: string;
  }[];
  background: string;
  groupIcon: string;
  id: number;
  at: string;
}

export interface eachUserInt {
  avatar: string;
  name: string;
  uid: string;
  friends: userInterface[];
  requests: userInterface[];
  sentReq: userInterface[];
  chats: {
    users: userInterface[];
    messages: chatInterface[];
    background: string;
    id: number;
  }[];
  groupChat: {
    users: userInterface[];
    title: string;
    messages: chatInterface[];
    background: string;
    groupIcon: string;
    id: number;
    at: string;
  }[];
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
  partner: string | null;
  setPartner: (newState: string) => void;
  groupId: number | null;
  setGroupId: (newState: number) => void;
};

const InitialValue = {
  isAuth: false,
  setIsAuth: () => {},
  users: [],
  setUsers: () => {},
  eachUser: null,
  setEachUser: () => {},
  partner: null,
  setPartner: () => {},
  groupId: null,
  setGroupId: () => {},
};

export const AppContext = createContext<AppContextType>(InitialValue);

export const AppContextProvider = ({ children }: Props) => {
  const [isAuth, setIsAuth] = useLocalStorage("isAuth", InitialValue.isAuth);
  const [users, setUsers] = useState<usersList[]>([]);
  const [eachUser, setEachUser] = useState<eachUserInt | null>(null);
  const [partner, setPartner] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
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
        groupId,
        setGroupId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
