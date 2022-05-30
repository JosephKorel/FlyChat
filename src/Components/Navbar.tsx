import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../Context/AuthContext";

function Navbar() {
  const { isAuth } = useContext(AppContext);
  return (
    <div>
      <Link to="/">Home</Link>
      {isAuth ? (
        <>
          <Link to="/profile">Profile</Link>
          <Link to="/user-chats">Conversas</Link>
        </>
      ) : (
        <Link to="/login">Entrar</Link>
      )}
    </div>
  );
}

export default Navbar;
