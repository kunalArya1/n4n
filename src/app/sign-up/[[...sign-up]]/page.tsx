import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="">
      <SignUp forceRedirectUrl="/dashboard" />
    </div>
  );
}
