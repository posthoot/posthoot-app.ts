"use client";
import { Logo } from "@/components/logo";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { Inter as Instrument_Serif } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

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
    <div
      className={
        "min-h-screen bg-[url('/assets/authbg.png')] bg-cover font-instrument bg-center bg-no-repeat flex"
      }
    >
      <div className="backdrop-blur-sm w-full h-screen">
        <div className="w-full h-full flex flex-col justify-between">
          <div className="my-auto">{children}</div>
          <div className="mb-10 text-5xl text-center font-normal text-primary-foreground">
            send . smart . campaigns{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
