import React, { createContext, ReactNode, useEffect, useState } from "react";
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

export interface eachChat {
  users: userInterface[];
  messages: chatInterface[];
  id: number;
  at: string;
}

export interface chatInterface {
  sender: string;
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
  groupIcon: string;
  id: string;
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
    id: number;
    at: string;
  }[];
  chatBg: string;
  groupChat: {
    users: userInterface[];
    title: string;
    messages: chatInterface[];
    groupIcon: string;
    id: string;
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
  groupId: string | null;
  setGroupId: (newState: string) => void;
  chatID: string | null;
  setChatID: (newState: string) => void;
  chatPage: { page: ReactNode; title?: string } | null;
  setChatPage: (newState: { page: ReactNode; title: string }) => void;
  isMobile: boolean;
  setIsMobile: (newState: boolean) => void;
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
  chatID: null,
  setChatID: () => {},
  chatPage: null,
  setChatPage: () => {},
  isMobile: false,
  setIsMobile: () => {},
};

export const AppContext = createContext<AppContextType>(InitialValue);

export const AppContextProvider = ({ children }: Props) => {
  const [isAuth, setIsAuth] = useLocalStorage("isAuth", InitialValue.isAuth);
  const [users, setUsers] = useState<usersList[]>([]);
  const [eachUser, setEachUser] = useState<eachUserInt | null>(null);
  const [partner, setPartner] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [chatID, setChatID] = useState<string | null>(null);
  const [chatPage, setChatPage] = useState<{
    page: ReactNode;
    title?: string;
  } | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const handleResize = () => {
    window.innerWidth < 1024 ? setIsMobile(true) : setIsMobile(false);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  });

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
        chatID,
        setChatID,
        chatPage,
        setChatPage,
        isMobile,
        setIsMobile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
