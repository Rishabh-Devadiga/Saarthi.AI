import { MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyFeedback() {
  return (
    <section className="l-card mx-auto mt-6 max-w-2xl p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-rule bg-paper">
        <MessageCircle className="h-6 w-6 text-muted" aria-hidden="true" />
      </div>
      <h1 className="mt-5">No feedback yet</h1>
      <p className="l-caption mt-3 leading-6">
        Generate a learning session first, and your AI feedback and study
        nudges will appear here.
      </p>
      <Link className="l-pill l-pill-primary mt-6" to="/chat">
        <Send className="h-4 w-4" aria-hidden="true" />
        Start in Chat
      </Link>
    </section>
  );
}
