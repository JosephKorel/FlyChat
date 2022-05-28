import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase-config";

function Navbar() {
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/user-chats">Conversas</Link>
    </div>
  );
}

export default Navbar;
