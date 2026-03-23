"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  ok: boolean;
  error?: string;
  message?: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: LoginResponse;
      try {
        data = (await res.json()) as LoginResponse;
      } catch {
        data = { ok: false, error: "Login failed." };
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? data.message ?? "Login failed.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-5"
    >
      <div className="flex flex-col gap-3 translate-x-7">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="sr-only">
            Admin email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-full border-2 border-[#5A6D78]/70 bg-[#B8DEE2] px-6 py-3 text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/70"
            placeholder="admin@email.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-full border-2 border-[#5A6D78]/70 bg-[#B8DEE2] px-6 py-3 text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/70"
            placeholder="password"
          />
        </div>
      </div>

      {error ? (
        <p
          className="text-sm text-red-700 w-full text-center transform translate-x-7"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <a
        href="/forgot"
        className="text-sm text-[#2E7D4F]/80 hover:text-[#2E7D4F] underline underline-offset-4 w-fit mx-auto translate-x-7"
      >
        Forgot email or password?
      </a>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#4AA3A9] text-white px-12 py-3 w-fit self-center disabled:opacity-60 hover:bg-[#379f4c] transition-colors transform translate-x-7"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}