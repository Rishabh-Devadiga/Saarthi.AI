import { LoaderCircle } from "lucide-react";

export function QuizLoading() {
  return (
    <section className="l-card mt-6 p-8 text-center">
      <LoaderCircle
        className="mx-auto h-8 w-8 animate-spin text-accent"
        aria-hidden="true"
      />
      <h2 className="mt-4">Preparing your quiz</h2>
      <p className="l-caption mt-2">
        Saarthi is turning your roadmap topics into five focused questions.
      </p>
    </section>
  );
}
