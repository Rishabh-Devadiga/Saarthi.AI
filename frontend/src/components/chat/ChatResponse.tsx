import {
  BookOpen,
  CheckCircle2,
  Clock,
  Lightbulb,
  MessageCircle,
  Target,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

import type { LearningSessionResponse } from "@/types/learning";

type ChatResponseProps = {
  response: LearningSessionResponse;
};

export function ChatResponse({ response }: ChatResponseProps) {
  const intent = response.learner_intent;
  const plan = response.learning_plan;
  const progress = response.progress_report;
  const feedback = response.feedback_report;
  const nudge = response.nudge_report;

  return (
    <section className="space-y-4">
      <div className="l-readout flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
        {response.workflow_completed
          ? "Learning workflow completed"
          : `Current stage: ${response.current_stage}`}
      </div>

      {intent ? (
        <ResponseCard
          icon={<Target className="h-5 w-5" aria-hidden="true" />}
          title="Learner Intent"
        >
          <DetailGrid>
            <DetailItem label="learning goal" value={intent.learning_goal} />
            <DetailItem label="subject" value={intent.subject} />
            <DetailItem
              label="current skill level"
              value={intent.current_skill_level}
            />
            <DetailItem label="target deadline" value={intent.target_deadline} />
            <DetailItem label="available time" value={intent.available_time} />
            <DetailItem
              label="learning style"
              value={intent.preferred_learning_style}
            />
          </DetailGrid>
        </ResponseCard>
      ) : null}

      {plan ? (
        <ResponseCard
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          title="Learning Plan"
        >
          <DetailGrid>
            <DetailItem label="learning goal" value={plan.learning_goal} />
            <DetailItem label="subject" value={plan.subject} />
            <DetailItem label="current skill level" value={plan.learner_level} />
            <DetailItem label="target deadline" value={plan.target_deadline} />
          </DetailGrid>
          {plan.overview ? (
            <div className="l-well mt-4 p-4">
              <p className="l-readout">overview</p>
              <p className="mt-2 leading-6 text-ink-2">{plan.overview}</p>
            </div>
          ) : null}
          {plan.phases.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {plan.phases.map((phase) => (
                <div
                  className="l-well p-4"
                  key={`${phase.phase_number}-${phase.title}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3>{phase.phase_number}. {phase.title}</h3>
                    <span className="l-tag">
                      <Clock className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                      {phase.estimated_duration}
                    </span>
                  </div>
                  <p className="mt-2 leading-6 text-ink-2">
                    {phase.objective}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </ResponseCard>
      ) : null}

      {progress ? (
        <ResponseCard
          icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
          title="Progress Summary"
        >
          <p className="leading-6 text-ink-2">{progress.summary}</p>
          <DetailGrid>
            <DetailItem
              label="completion"
              value={`${progress.overall_completion_percentage}%`}
            />
            <DetailItem label="status" value={progress.learner_status} />
            <DetailItem
              label="next task"
              value={progress.next_recommended_task}
            />
          </DetailGrid>
        </ResponseCard>
      ) : null}

      {feedback ? (
        <ResponseCard
          icon={<Lightbulb className="h-5 w-5" aria-hidden="true" />}
          title="Latest Feedback"
        >
          <p className="leading-6 text-ink-2">
            {feedback.overall_performance_assessment}
          </p>
          <p className="mt-3 font-medium text-ink">
            {feedback.motivation_message}
          </p>
        </ResponseCard>
      ) : null}

      {nudge ? (
        <ResponseCard
          icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
          title="Latest Nudge"
        >
          <p className="leading-6 text-ink-2">
            {nudge.personalized_message}
          </p>
          <DetailGrid>
            <DetailItem label="urgency" value={nudge.urgency} />
            <DetailItem label="recommended action" value={nudge.recommended_action} />
          </DetailGrid>
        </ResponseCard>
      ) : null}
    </section>
  );
}

type ResponseCardProps = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
};

function ResponseCard({ children, icon, title }: ResponseCardProps) {
  return (
    <article className="l-card p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rule bg-paper">
          <span className="text-accent">{icon}</span>
        </span>
        <h2 className="truncate">{title}</h2>
      </div>
      {children}
    </article>
  );
}

type DetailGridProps = {
  children: ReactNode;
};

function DetailGrid({ children }: DetailGridProps) {
  return <dl className="mt-4 grid gap-3 sm:grid-cols-2">{children}</dl>;
}

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
};

function DetailItem({ label, value }: DetailItemProps) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="l-well p-3">
      <dt className="l-readout">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
