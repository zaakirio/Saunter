"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button
        size="lg"
        onClick={() =>
          signIn.social({ provider: "google", callbackURL: "/" })
        }
      >
        Continue with Google
      </Button>
    </main>
  );
}
