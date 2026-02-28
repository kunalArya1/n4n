import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <SignIn
        forceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      />
    </div>
  );
}
