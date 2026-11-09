import { ExternalLink, LoaderCircle, PlayCircle } from "lucide-react";

import type { YouTubeVideo } from "@/services/youtubeService";

type TopicResourceButtonProps = {
  video: YouTubeVideo | null;
  isLoading: boolean;
};

export function TopicResourceButton({
  isLoading,
  video,
}: TopicResourceButtonProps) {
  if (isLoading) {
    return (
      <span className="l-tag shrink-0">
        <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
        finding tutorial
      </span>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <a
      className="l-pill l-pill-ghost h-9 shrink-0 px-3 py-0 text-xs"
      href={video.videoUrl}
      rel="noreferrer"
      target="_blank"
      title={`${video.title} by ${video.channel}`}
    >
      <PlayCircle className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
      Watch Tutorial
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}
