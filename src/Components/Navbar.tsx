import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../Context/AuthContext";

function Navbar() {
  const { isAuth } = useContext(AppContext);
  return (
    <div className="bg-paleyellow">
      <h1 className="p-2 text-4xl font-extrabold text-skyblue font-dancing">
        <span className="text-2xl italic text-stone-800 font-sans font-light">
          Fly
        </span>
        Chat
      </h1>
      {isAuth ? (
        <>
          <Link to="/profile">Profile</Link>
          <Link to="/user-chats">Conversas</Link>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Navbar;
