import { SignUp } from "@clerk/nextjs";

import { AuthPage } from "@/components/auth/auth-page";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthPage>
      <SignUp
        appearance={clerkAppearance}
        fallbackRedirectUrl="/editor"
        signInUrl="/sign-in"
      />
    </AuthPage>
  );
}
