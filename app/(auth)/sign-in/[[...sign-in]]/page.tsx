import { SignIn } from "@clerk/nextjs";

import { AuthPage } from "@/components/auth/auth-page";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthPage>
      <SignIn
        appearance={clerkAppearance}
        fallbackRedirectUrl="/editor"
        signUpUrl="/sign-up"
      />
    </AuthPage>
  );
}
