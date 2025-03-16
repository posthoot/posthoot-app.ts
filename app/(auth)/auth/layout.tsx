"use client";
import { Logo } from "@/components/logo";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const images = [
    "https://openwebui.com/assets/images/adam.jpg",
    "https://openwebui.com/assets/images/galaxy.jpg",
    "https://openwebui.com/assets/images/earth.jpg",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(Math.floor(Math.random() * images.length));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-14 h-14 absolute top-4 text-foreground left-4">
            <Logo />
          </div>
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </div>
      <div className="relative hidden flex-1 justify-center items-center lg:block">
        <div className="inset-0 flex h-screen relative gap-8 flex-col justify-center p-16">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt="Auth Background"
              className={`w-full absolute top-0 z-[-1] left-0 right-0 h-screen object-cover transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute top-0 left-0 h-full w-full bg-linear-to-t from-black from-40% to-transparent"></div>
          <div className="absolute top-0 left-0 h-full w-full bg-black/40 backdrop-blur-sm"></div>
          <div className="space-y-8 absolute bottom-10 z-10 text-center w-full left-1/2 -translate-x-1/2">
            <h1 className="text-2xl text-white lg:text-6xl md:text-5xl font-instrument font-light">
              Enter the Future
              <br />
              <span className="font-normal">of Email, today ✨</span>
            </h1>
            <span className="mx-auto text-white text-lg font-inter font-light text-center">
              Posthoot is a powerful email platform that helps you deliver{" "}
              <br />
              messages at scale with reliable inbox delivery, customizable{" "}
              <br />
              templates, and advanced analytics for your domain.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
