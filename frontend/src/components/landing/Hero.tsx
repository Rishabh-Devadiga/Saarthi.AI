import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/common/buttonVariants";
import { cn } from "@/utils/cn";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  // Subtle cursor parallax on the artwork (GPU transform only).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let frame = 0;
    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        section.style.setProperty("--space-px", px.toFixed(3));
        section.style.setProperty("--space-py", py.toFixed(3));
      });
    };
    section.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <section
      className="relative isolate overflow-hidden bg-[#0e0718] text-white"
      ref={sectionRef}
    >
      {/* screen.png space artwork: parallax layer + slow ken-burns layer */}
      <div
        aria-hidden="true"
        className="space-parallax pointer-events-none absolute inset-[-2.5%]"
      >
        <div className="space-drift h-full w-full bg-cover bg-center" />
      </div>

      {/* Readability scrims: clean visual area behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_52%_at_50%_44%,rgba(14,7,24,0.72),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0e0718]/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#0e0718]"
      />

      <div className="relative mx-auto flex min-h-[100svh] w-[min(100%-2rem,1180px)] flex-col items-center justify-center pb-20 pt-32 text-center sm:pt-36">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-teal-300"
          />
          AI-powered personalized learning
        </p>

        <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          Your learning journey,
          <br />
          guided by AI.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          Learn with a personalized path that adapts to you.
        </p>

        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            className={cn(buttonVariants({ size: "large" }), "w-full sm:w-auto")}
            to="/onboarding"
          >
            Start your journey
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            className={cn(
              buttonVariants({ size: "large", variant: "secondary" }),
              "w-full sm:w-auto",
            )}
            href="#features"
          >
            Explore Saarthi
          </a>
        </div>

        <p
          aria-hidden="true"
          className="mt-14 flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          Scroll to explore
          <span className="block h-8 w-px bg-gradient-to-b from-slate-500 to-transparent" />
        </p>
      </div>
    </section>
  );
}
