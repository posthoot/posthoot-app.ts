"use client";
import Intercom from "@intercom/messenger-js-sdk";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    Intercom({
      app_id: "ts43f4k1",
    });
  }, []);

  return (
    <div
      className={
        "min-h-screen bg-[url('/assets/authbg.png')] bg-cover font-instrument bg-center bg-no-repeat flex"
      }
    >
      <div className="backdrop-blur-sm w-full h-screen">
        <div className="w-full h-full flex flex-col justify-between">
          <div className="my-auto">
            <div className="w-full items-center justify-center flex">
              <img
                src="https://framerusercontent.com/images/Mj9OOgqyJTaP8t5wDmlauyecVM.png?scale-down-to=512"
                alt="logo"
                className="mx-auto h-10"
              />
            </div>
            {children}
          </div>
          <div className="mb-10 text-5xl text-center font-normal text-white">
            send . smart . campaigns{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
