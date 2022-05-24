import { createContext, ReactNode, useState } from "react";
import useLocalStorage from "../local-storage";

interface usersList {
  name: string;
  avatar: string;
  uid: string;
}

type Props = {
  children: ReactNode;
};

type AppContextType = {
  isAuth: boolean;
  setIsAuth: (newState: boolean) => void;
  users: usersList[];
  setUsers: (newState: usersList[]) => void;
};

const InitialValue = {
  isAuth: false,
  setIsAuth: () => {},
  users: [],
  setUsers: () => {},
};

export const AppContext = createContext<AppContextType>(InitialValue);

export const AppContextProvider = ({ children }: Props) => {
  const [isAuth, setIsAuth] = useLocalStorage("isAuth", InitialValue.isAuth);
  const [users, setUsers] = useState<usersList[]>([]);
  return (
    <AppContext.Provider value={{ isAuth, setIsAuth, users, setUsers }}>
      {children}
    </AppContext.Provider>
  );
};
