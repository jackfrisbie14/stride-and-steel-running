"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token || !email) {
    return (
      <div className="rounded-lg bg-zinc-800 p-6">
        <p className="text-red-500">Invalid reset link. Please request a new one.</p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm text-blue-500 hover:underline"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg bg-zinc-800 p-6">
        <p className="text-zinc-300">
          Your password has been reset successfully.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-blue-500 hover:underline"
        >
          Sign in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
        className="rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        required
        className="rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">
        Set New <span className="text-blue-500">Password</span>
      </h1>

      <p className="mt-4 max-w-md text-zinc-400">
        Enter your new password below.
      </p>

      <div className="mt-10 w-full max-w-sm">
        <Suspense fallback={<div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      <Link href="/" className="mt-10 text-sm text-zinc-500 hover:text-zinc-300">
        &larr; Back to Sign In
      </Link>
    </main>
  );
}
