import { ArrowRight, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";

const navigationItems = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Capabilities", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { isAuthenticated, user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("l-nav", (isScrolled || isOpen) && "is-scrolled")}>
      <div className="mx-auto flex h-16 w-[min(100%-2rem,74rem)] items-center justify-between gap-6">
        <Link aria-label="Saarthi.AI home" className="shrink-0" to="/">
          <img
            alt="Saarthi.AI"
            className="h-7 w-auto"
            draggable={false}
            src="/images/logo.png"
          />
        </Link>

        <div className="flex items-center gap-6">
          <nav
            aria-label="Landing page navigation"
            className="hidden items-center gap-6 lg:flex"
          >
            {navigationItems.map((item) => (
              <a className="l-navlink" href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
            <Link className="l-navlink" to="/my-learning">
              My Learning
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  aria-expanded={isAccountOpen}
                  aria-label="Account menu"
                  className="l-pill l-pill-ghost h-10 px-3 text-sm"
                  onClick={() => setIsAccountOpen((current) => !current)}
                  type="button"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper-3 font-[family-name:var(--font-outlier)] text-xs text-ink-2">
                    {(user?.name ?? "S").charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-28 truncate font-normal">
                    {user?.name ?? "Account"}
                  </span>
                </button>
                {isAccountOpen ? (
                  <div className="l-well absolute right-0 top-full z-50 mt-2 w-44 py-1">
                    <Link
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-2 transition-colors hover:text-ink"
                      onClick={() => setIsAccountOpen(false)}
                      to="/my-learning"
                    >
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                      My Learning
                    </Link>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink-2 transition-colors hover:text-ink"
                      onClick={() => {
                        setIsAccountOpen(false);
                        void signOut();
                      }}
                      type="button"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  className="l-navlink hidden sm:inline-flex"
                  to="/signin"
                >
                  Sign In
                </Link>
                <Link
                  className="l-navlink ml-2 hidden lg:inline-flex"
                  to="/signup"
                >
                  Sign Up
                </Link>
              </>
            )}
            <Link
              className="l-pill l-pill-primary h-11 px-4 text-sm"
              to="/onboarding"
            >
              Start Learning
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              aria-controls="mobile-navigation"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              className="l-pill l-pill-ghost h-10 w-10 px-0 md:hidden"
              onClick={() => setIsOpen((current) => !current)}
              type="button"
            >
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen ? (
        <nav
          aria-label="Mobile landing page navigation"
          className="border-t border-rule bg-paper px-4 py-4 md:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto flex w-full max-w-lg flex-col gap-1">
            {navigationItems.map((item) => (
              <a
                className="rounded-card px-4 py-3 text-sm text-ink-2 transition-colors hover:text-ink"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              className="rounded-card px-4 py-3 text-sm text-ink-2 transition-colors hover:text-ink"
              onClick={() => setIsOpen(false)}
              to="/my-learning"
            >
              My Learning
            </Link>
            {isAuthenticated ? (
              <>
                <span className="px-4 py-3 text-sm text-muted">
                  Signed in as {user?.name ?? "learner"}
                </span>
                <button
                  className="rounded-card px-4 py-3 text-left text-sm text-ink-2 transition-colors hover:text-ink"
                  onClick={() => {
                    setIsOpen(false);
                    void signOut();
                  }}
                  type="button"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-card px-4 py-3 text-sm text-ink-2 transition-colors hover:text-ink"
                  onClick={() => setIsOpen(false)}
                  to="/signin"
                >
                  Sign In
                </Link>
                <Link
                  className="rounded-card px-4 py-3 text-sm text-ink-2 transition-colors hover:text-ink"
                  onClick={() => setIsOpen(false)}
                  to="/signup"
                >
                  Sign Up
                </Link>
              </>
            )}
            <Link
              className="l-pill l-pill-primary mt-3 w-full justify-between"
              onClick={() => setIsOpen(false)}
              to="/onboarding"
            >
              Start Learning
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
