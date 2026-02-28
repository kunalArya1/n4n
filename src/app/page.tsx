import Image from "next/image";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className=" flex justify-between p-5">
      <h1>Home page</h1>
      <div className="flex gap-5">
        <SignInButton />
        <SignUpButton />
      </div>
    </div>
  );
}
