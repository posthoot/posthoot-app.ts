"use client";

import Link from "next/link";

export default function AcceptInvitePage() {
  return (
    <div className="flex items-center justify-center bg-transparent w-full md:w-1/2 mx-auto">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-4xl text-center font-normal dark:text-foreground text-white">
              hey, accept the invite to join posthoot
            </h1>
            <div className="text-center text-muted-foreground ">
              <Link href={"/auth/register"}>
                <div className="cursor-pointer flex mx-auto justify-center items-center w-[150px] !rounded-xl border border-white bg-primary-foreground gap-2 dark:text-foreground text-white px-5 py-2 mt-8">
                  <div>Accept Invite</div>
                </div>
              </Link>
              <Link href={"/auth/login"}>
                <div className="cursor-pointer flex mx-auto justify-center items-center w-[150px] gap-2 dark:text-foreground text-white mt-2">
                  <div>reject invite</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
