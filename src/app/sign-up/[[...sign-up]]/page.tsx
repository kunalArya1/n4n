"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !registrationComplete) {
      const registerAndRedirect = async () => {
        try {
          // Extract Clerk user ID
          const clerkUserId = user.id;

          // Generate username
          const username = `user_${clerkUserId.substring(0, 8)}`;


          // Register user in backend
          const response = await registerUser(username, clerkUserId);

          // Mark registration as complete
          setRegistrationComplete(true);

          // Redirect to dashboard
          router.push("/dashboard");
        } catch (err) {
          console.error("Sign-up error:", err);
          // Mark registration as complete even on error to prevent infinite loops
          setRegistrationComplete(true);
          // Still redirect to dashboard
          router.push("/dashboard");
        }
      };

      // Start registration process
      registerAndRedirect();
    }
  }, [isLoaded, user, router, registrationComplete]);

  // Use a different approach - let Clerk handle the redirect but ensure registration happens first
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        afterSignUpUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  );
}
