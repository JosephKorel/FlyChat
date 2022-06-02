import { Avatar, IconButton } from "@chakra-ui/react";
import React from "react";
import { FaUserFriends } from "react-icons/fa";
import { AiFillWechat } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router";
import { IoMdPersonAdd } from "react-icons/io";
import { auth } from "../firebase-config";

function BottomNav() {
  let location = useLocation().pathname;
  let navigate = useNavigate();
  return (
    <div className="flex align-center justify-around p3 bg-stone-100 border-t-[1px] border-skyblue sticky bottom-0 w-full">
      <div>
        <IconButton
          aria-label="chats"
          variant="flushed"
          color={location == "/user-chats" ? "#2a6fdb" : "blackAlpha.800"}
          icon={<AiFillWechat size={25} />}
          size="md"
          onClick={() => navigate("/user-chats")}
        ></IconButton>
      </div>
      <div>
        <IconButton
          aria-label="friends"
          variant="flushed"
          color={location == "/friends" ? "#2a6fdb" : "blackAlpha.800"}
          icon={<FaUserFriends size={25} />}
          size="md"
          onClick={() => navigate("/friends")}
        ></IconButton>
      </div>
      <div>
        <IconButton
          aria-label="friends"
          variant="flushed"
          color={location == "/add-friend" ? "#2a6fdb" : "blackAlpha.800"}
          icon={<IoMdPersonAdd size={25} />}
          size="md"
          onClick={() => navigate("/add-friend")}
        ></IconButton>
      </div>
      <div>
        <Avatar
          src={auth.currentUser?.photoURL!}
          size="sm"
          className="mt-1"
          onClick={() => navigate("/profile")}
        />
      </div>
    </div>
  );
}

export default BottomNav;
