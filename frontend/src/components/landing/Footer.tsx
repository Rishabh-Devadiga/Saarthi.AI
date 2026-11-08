import { Github } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer>
      <div className="mx-auto w-[min(100%-2rem,74rem)] py-[var(--section-gap-l)]">
        <p className="font-display text-display-s lowercase tracking-display">
          saarthi.ai
        </p>

        <div className="mt-10 flex flex-col gap-8 border-t border-rule pt-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="l-caption max-w-xs">
            AI-powered personalized learning.
          </p>
          <nav
            aria-label="Footer navigation"
            className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-8 sm:gap-y-2"
          >
            <a className="l-link" href="#how-it-works">
              How It Works
            </a>
            <a className="l-link" href="#features">
              Capabilities
            </a>
            <a className="l-link" href="#faq">
              FAQ
            </a>
            <Link className="l-link" to="/my-learning">
              My Learning
            </Link>
            <Link className="l-link" to="/signin">
              Sign In
            </Link>
            <Link className="l-link" to="/signup">
              Sign Up
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-muted">
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub repository coming soon
          </span>
          <p className="text-muted">
            Copyright 2026 Saarthi.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
