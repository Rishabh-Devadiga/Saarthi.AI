import { BarChart3, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";

export function InterviewAnalytics() {
  return (
    <section className="flex h-full min-h-72 flex-col rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-white">Interview Analytics</h2>
          <p className="mt-0.5 text-xs text-slate-400">Performance overview</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-7 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white/[0.05] text-slate-400">
          <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-sm font-bold text-white">
          No interviews completed yet
        </h3>
        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
          Complete your first mock interview to unlock average, best, latest,
          technical, communication, and confidence insights.
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-violet-500 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5"
          to="/interview"
        >
          Start Mock Interview
        </Link>
      </div>

      <p className="border-t border-white/[0.08] pt-4 text-xs text-slate-500">
        Last updated: No interview data
      </p>
    </section>
  );
}
