import { AlertTriangle, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";

export function SignInPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/my-learning", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setFormError("Enter your email and password.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      navigate("/my-learning", { replace: true });
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : "Sign in failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#080b14] text-white">
      <div className="landing-grid absolute inset-0 -z-20 opacity-25" />
      <div className="landing-light-path absolute inset-0 -z-10" />
      <div className="relative mx-auto flex min-h-screen w-[min(100%-2rem,560px)] flex-col items-center justify-center py-10">
        <Link
          aria-label="Return to Saarthi.AI home"
          className="mb-6 inline-flex items-center gap-2.5 font-semibold"
          to="/"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500 shadow-[0_8px_24px_rgba(59,130,246,0.35)]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg">Saarthi.AI</span>
        </Link>
      <div className="w-full rounded-[24px] border border-white/12 bg-white/8 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Sign in to open your saved learning roadmaps.
        </p>
        {formError ? (
          <div
            className="mt-4 flex items-start gap-3 rounded-md border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="signin-email">
              Email
            </label>
            <input
              autoComplete="email"
              className="mt-2 min-h-12 w-full rounded-md border border-white/12 bg-black/15 px-4 text-base text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              id="signin-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200" htmlFor="signin-password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className="mt-2 min-h-12 w-full rounded-md border border-white/12 bg-black/15 px-4 text-base text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              id="signin-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              type="password"
              value={password}
            />
          </div>
          <Button className="w-full" disabled={isSubmitting} size="large" type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          New to Saarthi?{" "}
          <Link className="font-semibold text-blue-300 hover:text-blue-200" to="/signup">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-400">
          Just exploring?{" "}
          <Link className="font-semibold text-blue-300 hover:text-blue-200" to="/onboarding">
            Continue as guest
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
