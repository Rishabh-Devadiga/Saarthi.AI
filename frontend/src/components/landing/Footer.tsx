import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#0b1020] text-slate-300">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_80%_at_50%_0%,rgba(59,130,246,0.14),transparent_70%),radial-gradient(ellipse_40%_60%_at_85%_100%,rgba(139,92,246,0.10),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
      />
      <div className="relative mx-auto flex w-[min(100%-2rem,1180px)] flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <img
            alt="Saarthi.AI"
            className="h-7 w-auto"
            draggable={false}
            src="/images/logo.png"
          />
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
            AI-powered personalized learning.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm sm:items-end">
          <span className="inline-flex items-center gap-2 text-slate-400">
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub repository coming soon
          </span>
          <p className="text-slate-500">
            Copyright 2026 Saarthi.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
