import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.tsx";

const DEMO_EMAIL = import.meta.env.DEV ? "test@gmail.com" : "";
const DEMO_PASSWORD = import.meta.env.DEV ? "test123456" : "";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, isLoading, login, register } = useSession();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);

  if (isAuthLoading) {
    return <div className="min-h-screen grid place-items-center text-sm text-[#6C7A72]">Checking account…</div>;
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
      navigate("/dashboard", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not authenticate. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9F6] px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-[#E2E7E2] bg-white p-7 sm:p-9 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F2E24]">CareGuide</p>
        <h1 className="mt-3 text-2xl font-extrabold text-[#131B17]">
          {isRegistering ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-[#6C7A72]">
          {isRegistering
            ? "Create an account to keep your care plan and progress private."
            : "Sign in to continue to CareGuide."}
        </p>

        {!isRegistering && import.meta.env.DEV && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Demo sign-in is prefilled. This account is shared: information and photos
            added here can be seen by anyone using the demo account. Create an account
            for private data.
          </div>
        )}

        {error && (
          <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isRegistering && (
            <label className="block text-sm font-medium text-[#17211D]">
              Name
              <input
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2E7E2] bg-[#F8F9F6] px-3.5 py-3 text-sm outline-none focus:border-[#0F2E24]"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-[#17211D]">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2E7E2] bg-[#F8F9F6] px-3.5 py-3 text-sm outline-none focus:border-[#0F2E24]"
            />
          </label>
          <label className="block text-sm font-medium text-[#17211D]">
            Password
            <input
              type="password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              required
              minLength={isRegistering ? 10 : 1}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2E7E2] bg-[#F8F9F6] px-3.5 py-3 text-sm outline-none focus:border-[#0F2E24]"
            />
            {isRegistering && <span className="mt-1 block text-xs text-[#6C7A72]">Use at least 10 characters.</span>}
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#0F2E24] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0a2119] disabled:opacity-60"
          >
            {isLoading ? "Please wait…" : isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6C7A72]">
          {isRegistering ? "Already have an account?" : "New to CareGuide?"}{" "}
          <button
            type="button"
            onClick={() => {
              const nextIsRegistering = !isRegistering;
              setIsRegistering(nextIsRegistering);
              setEmail(nextIsRegistering ? "" : DEMO_EMAIL);
              setPassword(nextIsRegistering ? "" : DEMO_PASSWORD);
              setError(null);
            }}
            className="font-semibold text-[#0F2E24] hover:underline"
          >
            {isRegistering ? "Sign in" : "Create Account"}
          </button>
        </p>
      </section>
    </main>
  );
};
