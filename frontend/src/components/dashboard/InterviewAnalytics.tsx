import { BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";

export function InterviewAnalytics() {
  return (
    <section className="l-card flex h-full flex-col p-5">
      <p className="l-readout">interview performance</p>
      <h2 className="mt-2">Interview Analytics</h2>

      <div className="flex flex-1 flex-col items-center justify-center py-7 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-rule bg-paper">
          <BriefcaseBusiness
            className="h-6 w-6 text-muted"
            aria-hidden="true"
          />
        </span>
        <h3 className="mt-4">No interviews completed yet</h3>
        <p className="l-caption mt-2 max-w-sm leading-6">
          Complete your first mock interview to unlock technical,
          communication, and confidence insights.
        </p>
        <Link className="l-pill l-pill-primary mt-5" to="/interview">
          Start Mock Interview
        </Link>
      </div>

      <p className="l-readout border-t border-rule pt-4">
        last updated: no interview data
      </p>
    </section>
  );
}
