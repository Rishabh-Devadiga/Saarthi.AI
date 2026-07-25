import { ArrowRight, BookOpenCheck } from "lucide-react";
import { Link } from "react-router-dom";

type WelcomeCardProps = {
  learnerName: string | null;
  learningGoal: string | null;
  subject: string | null;
};

export function WelcomeCard({
  learnerName,
  learningGoal,
  subject,
}: WelcomeCardProps) {
  return (
    <section className="rounded-md border border-white/[0.08] bg-[linear-gradient(120deg,#1A2235,rgba(30,41,59,0.82))] p-6 shadow-sm sm:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white">
            <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Welcome{learnerName ? `, ${learnerName}` : ""}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-white sm:text-3xl">
            Your learning dashboard
          </h1>
          {learningGoal ? (
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              {learningGoal}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5"
            to="/learning-plan"
          >
            Learning Plan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-5 text-sm font-bold text-slate-200 transition hover:bg-white/[0.05]"
            to="/progress"
          >
            Progress
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      {subject ? (
        <div className="mt-5 inline-flex rounded-md bg-white/[0.05] px-3 py-2 text-sm font-semibold text-blue-200">
          Subject: {subject}
        </div>
      ) : null}
    </section>
  );
}
