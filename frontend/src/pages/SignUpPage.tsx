import { AlertTriangle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Navbar } from "@/components/landing/Navbar";
import { ApiRequestError } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";

function validateForm(name: string, email: string, password: string): string | null {
  if (!name.trim()) {
    return "Enter your name.";
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return "Enter a valid email address.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  return null;
}

export function SignUpPage() {
  const { isAuthenticated, signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
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
    const validationError = validateForm(name, email, password);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setEmailTaken(false);
    setIsSubmitting(true);
    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
      navigate("/my-learning", { replace: true });
    } catch (requestError) {
      if (
        requestError instanceof ApiRequestError &&
        requestError.errorCode === "email_taken"
      ) {
        setEmailTaken(true);
      } else {
        setFormError(
          requestError instanceof Error ? requestError.message : "Sign up failed."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="lumen">
      <Navbar />
      <main className="mx-auto flex w-full min-w-0 max-w-md flex-col px-4 pb-16 pt-12 sm:pt-20">
        <h1 className="text-(length:var(--text-2xl))">Create your account</h1>
        <p className="mt-3 text-ink-2">
          Save roadmaps, track progress, and pick up on any device.
        </p>
        <div className="l-well mt-8 p-6 sm:p-8">
          {emailTaken ? (
            <div className="l-alert flex items-start gap-3 p-4 text-sm" role="alert">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                An account with this email already exists.{" "}
                <Link className="l-link font-medium" to="/signin">
                  Sign in instead
                </Link>
              </span>
            </div>
          ) : null}
          {formError ? (
            <div className="l-alert flex items-start gap-3 p-4 text-sm" role="alert">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          ) : null}
          <form
            className={formError || emailTaken ? "mt-6 space-y-5" : "space-y-5"}
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div>
              <label className="block text-sm text-ink-2" htmlFor="signup-name">
                Name
              </label>
              <input
                aria-invalid={formError ? true : undefined}
                autoComplete="name"
                className="l-field mt-2 w-full text-base placeholder:text-muted"
                id="signup-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                type="text"
                value={name}
              />
            </div>
            <div className="mt-5">
              <label className="block text-sm text-ink-2" htmlFor="signup-email">
                Email
              </label>
              <input
                aria-invalid={formError ? true : undefined}
                autoComplete="email"
                className="l-field mt-2 w-full text-base placeholder:text-muted"
                id="signup-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </div>
            <div className="mt-5">
              <label className="block text-sm text-ink-2" htmlFor="signup-password">
                Password
              </label>
              <input
                aria-invalid={formError ? true : undefined}
                autoComplete="new-password"
                className="l-field mt-2 w-full text-base placeholder:text-muted"
                id="signup-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                type="password"
                value={password}
              />
            </div>
            <button
              className="l-pill l-pill-primary mt-7 w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <div aria-hidden="true" className="l-dline mt-7" />
          <p className="mt-6 text-sm text-ink-2">
            Already have an account?{" "}
            <Link className="l-link font-medium" to="/signin">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-sm text-ink-2">
            Just exploring?{" "}
            <Link className="l-link font-medium" to="/onboarding">
              Continue as guest
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
