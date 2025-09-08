import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import DiscImage from "@/assets/disc.webp";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={DiscImage}
          alt="Disc"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <Image
                width={24}
                height={24}
                src="/logo.png"
                alt="logo"
                className="size-8 rounded-xl"
              />
            </div>
            Music Player
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
