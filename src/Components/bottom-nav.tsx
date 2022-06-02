import { IconButton } from "@chakra-ui/react";
import React from "react";
import { FaUserFriends } from "react-icons/fa";
import { AiFillWechat } from "react-icons/ai";
import { MdPersonPin } from "react-icons/md";
import { useLocation, useNavigate } from "react-router";
import { AiOutlineUserAdd } from "react-icons/ai";
import { IoMdPersonAdd } from "react-icons/io";

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
          icon={<AiFillWechat size={30} />}
          size="md"
          onClick={() => navigate("/user-chats")}
        ></IconButton>
      </div>
      <div>
        <IconButton
          aria-label="friends"
          variant="flushed"
          color={location == "/friends" ? "#2a6fdb" : "blackAlpha.800"}
          icon={<FaUserFriends size={30} />}
          size="md"
          onClick={() => navigate("/friends")}
        ></IconButton>
      </div>
      <div>
        <IconButton
          aria-label="friends"
          variant="flushed"
          color={location == "/add-friend" ? "#2a6fdb" : "blackAlpha.800"}
          icon={<IoMdPersonAdd size={30} />}
          size="md"
          onClick={() => navigate("/add-friend")}
        ></IconButton>
      </div>
      <div>
        <IconButton
          aria-label="friends"
          variant="flushed"
          color={location == "/profile" ? "#2a6fdb" : "blackAlpha.800"}
          icon={<MdPersonPin size={30} />}
          size="md"
          onClick={() => navigate("/profile")}
        ></IconButton>
      </div>
    </div>
  );
}

export default BottomNav;
