import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { buttonVariants } from "@/components/common/buttonVariants";
import { cn } from "@/utils/cn";

const navigationItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
      <div className="mx-auto flex h-18 w-[min(100%-2rem,1180px)] items-center justify-between">
        <Link
          aria-label="Saarthi.AI home"
          className="inline-flex items-center gap-2.5 font-semibold"
          to="/"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-400 text-[#06281f] shadow-[0_8px_24px_rgba(45,212,191,0.35)]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg">Saarthi.AI</span>
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
            to="/dashboard"
          >
            Sign in
          </Link>
          <Link
            className={cn(buttonVariants(), "ml-3 min-h-10 px-4")}
            to="/onboarding"
          >
            Start learning
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
              to="/dashboard"
            >
              Sign in
            </Link>
            <Link
              className={cn(buttonVariants(), "mt-3 w-full")}
              onClick={() => setIsOpen(false)}
              to="/onboarding"
            >
              Start learning
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
