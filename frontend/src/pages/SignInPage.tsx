import { AlertTriangle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Navbar } from "@/components/landing/Navbar";
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
    <div className="lumen">
      <Navbar />
      <main className="l-enter mx-auto flex min-h-[calc(100dvh-4rem)] w-full min-w-0 max-w-md flex-col justify-center px-4 pb-12 pt-10">
        <h1 className="text-(length:var(--text-2xl))">Welcome back</h1>
        <p className="mt-3 text-ink-2">
          Sign in to open your saved learning roadmaps.
        </p>
        <form
          className="l-well mt-8 w-full p-6 sm:p-8"
          onSubmit={(event) => void handleSubmit(event)}
        >
          {formError ? (
            <div className="l-alert flex items-start gap-3 p-4 text-sm" role="alert">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          ) : null}
          <div className={formError ? "mt-6" : ""}>
            <label className="block text-sm text-ink-2" htmlFor="signin-email">
              email
            </label>
            <input
              aria-invalid={formError ? true : undefined}
              autoComplete="email"
              className="l-field mt-2 w-full text-base placeholder:text-muted"
              id="signin-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </div>
          <div className="mt-5">
            <label className="block text-sm text-ink-2" htmlFor="signin-password">
              password
            </label>
            <input
              aria-invalid={formError ? true : undefined}
              autoComplete="current-password"
              className="l-field mt-2 w-full text-base placeholder:text-muted"
              id="signin-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              type="password"
              value={password}
            />
          </div>
          <button
            className="l-pill l-pill-primary mt-7 w-full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-8 text-sm text-ink-2">
          New to Saarthi?{" "}
          <Link className="l-link font-medium" to="/signup">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-sm text-ink-2">
          Just exploring?{" "}
          <Link className="l-link font-medium" to="/onboarding">
            Continue as guest
          </Link>
        </p>
      </main>
    </div>
  );
}
