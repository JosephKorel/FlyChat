import React from "react";

function Alert({ msg, error }: { msg?: string; error: string }) {
  return (
    <div className="absolute h-screen w-full font-sans">
      <div className="absolute w-full bottom-10 flex justify-center">
        <p
          className={`p-3 rounded-md ${msg && "bg-lime-600 text-dark"} ${
            error && "bg-red-500 text-gray-100"
          }`}
        >
          {msg && msg}
          {error && error}
        </p>
      </div>
    </div>
  );
}

export default Alert;
