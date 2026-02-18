"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Show success regardless to prevent enumeration
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">
        Reset Your <span className="text-blue-500">Password</span>
      </h1>

      <p className="mt-4 max-w-md text-zinc-400">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <div className="mt-10 w-full max-w-sm">
        {submitted ? (
          <div className="rounded-lg bg-zinc-800 p-6">
            <p className="text-zinc-300">
              If an account exists with that email, we sent a reset link. Check your inbox.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm text-blue-500 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>

      <Link href="/" className="mt-10 text-sm text-zinc-500 hover:text-zinc-300">
        &larr; Back to Sign In
      </Link>
    </main>
  );
}
