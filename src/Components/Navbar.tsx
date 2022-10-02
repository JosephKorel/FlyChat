import React, { useContext } from "react";
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
          <div className="fixed top-0 w-full z-10">
            {/* <h1 className="p-2 text-4xl font-extrabold text-dark font-dancing bg-lime">
              <span className="text-2xl italic text-skyblue font-sans font-bold">
                Fly
              </span>
              Chat
            </h1> */}
            <div className="inline-block">
              <h1 className="p-2 px-4 text-md text-dark rounded-br-lg font-title font-bold bg-lime">
                {location == "/profile" && "PERFIL"}
                {location == "/" && "CONVERSAS"}
                {location == "/friends" && "AMIGOS"}
                {location == "/add-friend" && "ADICIONAR AMIGO"}
              </h1>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
