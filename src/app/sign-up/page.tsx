"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { signIn, signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEmailSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message || "Unable to create the account.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  function handleGoogleSignUp() {
    setError(null);

    startTransition(async () => {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (result?.error) {
        setError(result.error.message || "Google sign-up is not available yet.");
      }
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Darwinly" className="h-12 w-12" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create an account</h1>
          <p className="text-sm text-muted-foreground">Start tracking how ideas evolve</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form className="space-y-4" onSubmit={handleEmailSignUp}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <input
                id="name"
                required
                name="name"
                type="text"
                placeholder="Ada Lovelace"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                required
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                required
                minLength={8}
                name="password"
                type="password"
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isPending}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}