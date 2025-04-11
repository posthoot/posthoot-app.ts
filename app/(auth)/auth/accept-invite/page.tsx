"use client";


export default function AcceptInvitePage() {
  const acceptInvite = async () => {
    console.log("Accept invite");
  };

  return (
    <div className="flex items-center justify-center bg-transparent w-1/2 mx-auto">
      <div className="w-full bg-transparent p-8">
        <div className="mb-8 grid gap-4">
          <div className="grid">
            <h1 className="text-4xl text-center font-normal text-primary-foreground">
              hey, accept the invite to join
              <br />
              {"Team Name"}
            </h1>
            <div className="text-center text-muted-foreground ">
              <div className="cursor-pointer flex mx-auto justify-center items-center w-[150px] !rounded-xl border border-white bg-primary-foreground gap-2 text-foreground px-5 py-2 mt-8">
                <div>Accept Invite</div>
              </div>
              <div className="cursor-pointer flex mx-auto justify-center items-center w-[150px] gap-2 text-primary-foreground mt-2">
                <div>reject invite</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
