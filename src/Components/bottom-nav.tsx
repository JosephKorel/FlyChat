import { Avatar, IconButton } from "@chakra-ui/react";
import React from "react";
import { FaUserFriends } from "react-icons/fa";
import { AiFillWechat } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router";
import { IoMdPersonAdd } from "react-icons/io";
import { auth } from "../firebase-config";
import { BsFillPersonFill } from "react-icons/bs";

function BottomNav() {
  let location = useLocation().pathname;
  let navigate = useNavigate();

  const onThisPage = (page: string) => {
    return location == page ? true : false;
  };
  return (
    <>
      {location == "/chat" ||
      location == "/group-chat" ||
      location == "/group-config" ? (
        <></>
      ) : (
        <div className="px-2 fixed bottom-4 w-full">
          <div className="flex align-center justify-around bg-lime rounded-lg">
            <div>
              <button
                onClick={() => navigate("/chats")}
                className={`p-1 rounded-full ${
                  onThisPage("/chats")
                    ? "bg-lime text-dark -translate-y-4"
                    : "text-dark"
                }`}
              >
                <AiFillWechat size={25} />
              </button>
            </div>
            <div>
              <button
                onClick={() => navigate("/friends")}
                className={`p-1 rounded-full ${
                  onThisPage("/friends")
                    ? "bg-lime text-dark -translate-y-4"
                    : "text-dark"
                }`}
              >
                <FaUserFriends size={25} />
              </button>
            </div>
            <div>
              <button
                onClick={() => navigate("/add-friend")}
                className={`p-1 rounded-full ${
                  onThisPage("/add-friend")
                    ? "bg-lime text-dark -translate-y-4"
                    : "text-dark"
                }`}
              >
                <IoMdPersonAdd size={25} />
              </button>
            </div>
            <div>
              {/* <Avatar
                src={auth.currentUser?.photoURL!}
                size="sm"
                className="mt-1"
                onClick={() => navigate("/profile")}
              /> */}
              <button
                onClick={() => navigate("/profile")}
                className={`p-1 rounded-full ${
                  onThisPage("/profile")
                    ? "bg-lime text-dark -translate-y-4"
                    : "text-dark"
                }`}
              >
                <BsFillPersonFill size={25} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BottomNav;
