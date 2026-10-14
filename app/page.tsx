
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);







  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setError("");
    setLoading(true);




    try {
      const res = await fetch("https://schedura-su4v.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Something went wrong.");
      }

      localStorage.setItem("supabaseSession", JSON.stringify(data.session));

      if (!data.session?.access_token || data.session?.user?.role !== "admin") {
      router.push("/home");
    }
    else{
       router.push("/admin");
    }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-white px-4 py-12">
      {/* Soft background blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-violet-200/40 backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Schedura</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome Back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>


          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-600">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
          </div>

          {/* Password with toggle */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-600">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
                className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-violet-500">
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-300/50 transition hover:from-violet-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't Have an Account ?{" "}
          <Link href="/signup" className="font-medium text-violet-600 hover:text-violet-700">Sign Up</Link>
        </p>
        <p className="mt-1 text-center text-sm text-slate-500">
          
          <Link href="/adminLogin" className="font-medium text-violet-600 hover:text-violet-700">Log In as Admin</Link>
        </p>
      </div>
    </main>
  );
} 