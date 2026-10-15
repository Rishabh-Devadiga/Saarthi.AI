import { ArrowRight, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";

const navigationItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
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
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 text-white transition-colors duration-300",
        isScrolled || isOpen
          ? "border-b border-white/10 bg-[#070b16]/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="flex h-18 w-full items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link aria-label="Saarthi.AI home" className="shrink-0" to="/">
          <img
            alt="Saarthi.AI"
            className="h-8 w-auto"
            draggable={false}
            src="/images/logo.png"
          />
        </Link>

        <nav
          aria-label="Landing page navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navigationItems.map((item) => (
            <a
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/8 hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
          <Link
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/8 hover:text-white"
            to="/my-learning"
          >
            My Learning
          </Link>
          {isAuthenticated ? (
            <div className="relative ml-3">
              <button
                aria-expanded={isAccountOpen}
                aria-label="Account menu"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                onClick={() => setIsAccountOpen((current) => !current)}
                type="button"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold">
                  {(user?.name ?? "S").charAt(0).toUpperCase()}
                </span>
                <span className="max-w-28 truncate">{user?.name ?? "Account"}</span>
              </button>
              {isAccountOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-md border border-white/10 bg-[#0b1020] shadow-xl">
                  <Link
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/8"
                    onClick={() => setIsAccountOpen(false)}
                    to="/my-learning"
                  >
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    My Learning
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/8"
                    onClick={() => {
                      setIsAccountOpen(false);
                      void signOut();
                    }}
                    type="button"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/8 hover:text-white"
                to="/signin"
              >
                Sign in
              </Link>
              <Link className="cta-nav ml-2 shrink-0" to="/signup">
                <span className="cta-label">Sign up</span>
                <span className="cta-arrow" aria-hidden="true">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </>
          )}
          <Link className="cta-nav ml-2 shrink-0" to="/onboarding">
            <span className="cta-label">Start learning</span>
            <span className="cta-arrow" aria-hidden="true">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </nav>

        <Button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          size="icon"
          variant="secondary"
        >
          {isOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      {isOpen ? (
        <nav
          aria-label="Mobile landing page navigation"
          className="border-t border-white/10 bg-[#070b16]/95 px-4 py-4 backdrop-blur-xl md:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto flex w-full max-w-lg flex-col gap-1">
            {navigationItems.map((item) => (
              <a
                className="rounded-md px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/8"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              className="rounded-md px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/8"
              onClick={() => setIsOpen(false)}
              to="/my-learning"
            >
              My Learning
            </Link>
            {isAuthenticated ? (
              <>
                <span className="px-4 py-3 text-sm font-semibold text-slate-400">
                  Signed in as {user?.name ?? "learner"}
                </span>
                <button
                  className="rounded-md px-4 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/8"
                  onClick={() => {
                    setIsOpen(false);
                    void signOut();
                  }}
                  type="button"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-md px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/8"
                  onClick={() => setIsOpen(false)}
                  to="/signin"
                >
                  Sign in
                </Link>
                <Link
                  className="rounded-md px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/8"
                  onClick={() => setIsOpen(false)}
                  to="/signup"
                >
                  Sign up
                </Link>
              </>
            )}
            <Link
              className="cta-nav mt-3 w-full justify-between"
              onClick={() => setIsOpen(false)}
              to="/onboarding"
            >
              <span className="cta-label">Start learning</span>
              <span className="cta-arrow" aria-hidden="true">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
