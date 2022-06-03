import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../Context/AuthContext";
import { useLocation } from "react-router-dom";

function Navbar() {
  const { isAuth } = useContext(AppContext);
  let location = useLocation().pathname;
  return (
    <>
      {location === "/chat" ? (
        <></>
      ) : (
        <div className="bg-skyblue">
          <h1 className="p-2 text-4xl font-extrabold text-stone-100 font-dancing">
            <span className="text-2xl italic text-paleyellow-800 font-sans font-normal">
              Fly
            </span>
            Chat
          </h1>
        </div>
      )}
    </>
  );
}

export default Navbar;
