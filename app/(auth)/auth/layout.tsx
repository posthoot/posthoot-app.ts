import Image from "next/image";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=sentient@400&display=swap"
          rel="stylesheet"
        />
        <link type="text/css" rel="stylesheet" href="/auth/style.css" />
      </head>
      <body className="antialiased font-sentient">
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="outline-0 fixed inset-0 bg-white">
            <div className="EntryScreen_stars__Gte0A">
              <Image
                alt=""
                width="1132"
                height="396"
                data-nimg="1"
                className="Image_image__5RgVm Image_loaded__qmdFe"
                src="/assets/stars.svg"
              />
            </div>
            <Image
              alt=""
              data-nimg="fill"
              className="absolute h-full w-full inline-block object-cover inset-0 text-transparent Image_image__5RgVm Image_loaded__qmdFe"
              sizes="100vw"
              width={100}
              height={100}
              src="/assets/bg-entry.png"
            />
          </div>
          <div className="relative z-[3] flex flex-col justify-center items-center min-h-[100svh] p-12">
            <div className="relative EntryScreen_body__YQg8x w-full max-w-lg rounded-3xl">
              <div>
                <div className="EntryScreen_line__o9UiD">
                  <Image
                    alt=""
                    width="401"
                    height="256"
                    data-nimg="1"
                    className="Image_image__5RgVm Image_loaded__qmdFe"
                    src="/assets/entry-lines-left.svg"
                  />
                </div>
                <div className="EntryScreen_line__o9UiD">
                  <Image
                    alt=""
                    width="401"
                    height="256"
                    data-nimg="1"
                    className="Image_image__5RgVm Image_loaded__qmdFe"
                    src="/assets/entry-lines-right.svg"
                  />
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
