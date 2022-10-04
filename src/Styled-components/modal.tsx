import React from "react";

function Modal({
  children,
  setShow,
}: {
  children: JSX.Element;
  setShow: (data: boolean) => void;
}) {
  return (
    <div
      className="fixed top-0 w-full h-screen z-20 backdrop-blur-sm"
      onClick={() => setShow(false)}
    >
      <div className="h-full translate-y-1/4 px-4">{children}</div>
    </div>
  );
}

export default Modal;
