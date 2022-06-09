import React, { FormEvent } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase-config";
import { useNavigate } from "react-router";
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationRes: any;
  }
}

export const generateRecaptcha = () => {
  window.recaptchaVerifier = new RecaptchaVerifier(
    "recaptcha-container",
    {
      size: "invisible",
      callback: (res: any) => {},
    },
    auth
  );
};

export const requestOTP = (
  e: FormEvent,
  number: string,
  setDisable: (newState: boolean) => void
) => {
  e.preventDefault();
  if (number.length > 8) {
    generateRecaptcha();
    let appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, "+55" + number, appVerifier)
      .then((confirmationRes) => {
        setDisable(false);
        window.confirmationRes = confirmationRes;
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

export const verifyOTP = (
  inputId: string,
  setIsVer: ((state: boolean) => void) | null,
  setProfile: (() => void) | null,
  setIsAuth: ((state: boolean) => void) | null,
  nav: ((data: string) => void) | null
) => {
  let codeInput = document.getElementById(inputId) as HTMLInputElement;

  if (codeInput.value.length === 6) {
    let confirmationRes = window.confirmationRes;
    confirmationRes
      .confirm(codeInput.value)
      .then((res: any) => {
        setIsVer && setIsVer(true);
        setProfile && setProfile();
        setIsAuth && setIsAuth(true);
        nav && nav("/");
      })
      .catch((error: ErrorCallback) => console.log(error));
  }
};
