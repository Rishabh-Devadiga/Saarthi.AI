import { CheckCircle2, Clock3 } from "lucide-react";

import { TopicResourceButton } from "@/components/learning-plan/TopicResourceButton";
import type { YouTubeVideo } from "@/services/youtubeService";

type TopicCardProps = {
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string | null;
  isCompleted: boolean;
  isVideoLoading: boolean;
  onToggle: (completed: boolean) => void;
  topic: string;
  video: YouTubeVideo | null;
};

export function TopicCard({
  difficulty,
  estimatedTime,
  isCompleted,
  isVideoLoading,
  onToggle,
  topic,
  video,
}: TopicCardProps) {
  return (
    <article className="border border-rule bg-paper p-4">
      <div className="flex gap-3">
        <input
          aria-label={`Mark ${topic} complete`}
          checked={isCompleted}
          className="mt-0.5 h-4 w-4 shrink-0"
          onChange={(event) => onToggle(event.target.checked)}
          type="checkbox"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="min-w-0 [overflow-wrap:anywhere] text-sm text-ink">
                {topic}
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="l-tag">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  {isVideoLoading
                    ? "estimating learning time…"
                    : estimatedTime
                      ? `estimated time · ${estimatedTime}`
                      : "estimated time unavailable"}
                </span>
                <span className="l-tag">{difficulty}</span>
                {isCompleted ? (
                  <span className="l-tag border-accent text-ink">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    completed
                  </span>
                ) : null}
              </div>
            </div>
            <TopicResourceButton isLoading={isVideoLoading} video={video} />
          </div>
          {video ? (
            <div className="l-stage mt-3 flex min-w-0 gap-3 p-3">
              {video.thumbnailUrl ? (
                <img
                  alt=""
                  className="h-16 w-24 shrink-0 object-cover"
                  src={video.thumbnailUrl}
                />
              ) : null}
              <div className="min-w-0">
                <p className="line-clamp-2 text-xs leading-5 text-ink-2">
                  {video.title}
                </p>
                <p className="l-readout mt-1">{video.channel}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
