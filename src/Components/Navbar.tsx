import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../Context/AuthContext";
import { useLocation } from "react-router-dom";

function Navbar() {
  const { isAuth } = useContext(AppContext);
  let location = useLocation().pathname;
  return (
    <>
      {location === "/chat" ||
      location == "/group-chat" ||
      location == "/group-config" ? (
        <></>
      ) : (
        <>
          <div className=" sticky top-0 w-full z-10">
            <h1 className="p-2 text-4xl font-extrabold text-stone-100 font-dancing bg-skyblue">
              <span className="text-2xl italic text-paleyellow-800 font-sans font-normal">
                Fly
              </span>
              Chat
            </h1>
            <div className="inline-block">
              <h1 className="p-2 px-4 text-md text-stone-100 rounded-br-lg font-sans font-bold bg-skyblue">
                {location == "/profile" && "Perfil"}
                {location == "/user-chats" && "Conversas"}
                {location == "/friends" && "Amigos"}
                {location == "/add-friend" && "Adicionar Amigo"}
              </h1>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
