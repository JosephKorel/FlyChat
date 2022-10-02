import { FaUserFriends } from "react-icons/fa";
import { AiFillWechat } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router";
import { IoMdPersonAdd } from "react-icons/io";
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
          <div className="flex items-center justify-around text-dark bg-gray-100 rounded-lg">
            <div>
              <button
                onClick={() => navigate("/")}
                className={`p-1 rounded-md ${
                  onThisPage("/")
                    ? "bg-gradient-to-b from-dark to-dark text-lime goup"
                    : ""
                }`}
              >
                <AiFillWechat size={25} />
              </button>
            </div>
            <div>
              <button
                onClick={() => navigate("/friends")}
                className={`p-1 rounded-md ${
                  onThisPage("/friends")
                    ? "bg-gradient-to-b from-dark to-dark text-lime goup"
                    : ""
                }`}
              >
                <FaUserFriends size={25} />
              </button>
            </div>
            <div>
              <button
                onClick={() => navigate("/add-friend")}
                className={`p-1 rounded-md ${
                  onThisPage("/add-friend")
                    ? "bg-gradient-to-b from-dark to-dark text-lime goup"
                    : ""
                }`}
              >
                <IoMdPersonAdd size={25} />
              </button>
            </div>
            <div>
              <button
                onClick={() => navigate("/profile")}
                className={`p-1 rounded-md ${
                  onThisPage("/profile")
                    ? "bg-gradient-to-b from-dark to-dark text-lime goup"
                    : ""
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
