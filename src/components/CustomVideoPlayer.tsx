import React, { useEffect, useRef, useState } from "react";

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  isPreview?: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
  showProgress?: boolean;
  wrapperClassName?: string;
  className?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const formatTime = (time: number) => {
  if (!Number.isFinite(time) || time < 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const PlayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-7 w-7"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-7 w-7"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  title,
  thumbnailUrl,
  mimeType,
  isPreview = false,
  autoPlay = false,
  showControls = true,
  showProgress = true,
  wrapperClassName = "",
  className = "",
  videoRef,
}) => {
  const internalRef = useRef<HTMLVideoElement>(null);
  const resolvedRef = videoRef ?? internalRef;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [iframeActive, setIframeActive] = useState(false);

  const isNativeVideo =
    (mimeType?.startsWith("video/") ?? false) ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(src);

  useEffect(() => {
    const video = resolvedRef.current;
    if (!video || !isNativeVideo) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [resolvedRef, isNativeVideo]);

  const togglePlay = async () => {
    const video = resolvedRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        // ignore autoplay restrictions
      }
    } else {
      video.pause();
    }
  };

  const handleLoadedMetadata = (
    event: React.SyntheticEvent<HTMLVideoElement>,
  ) => {
    const video = event.currentTarget;
    setDuration(video.duration);
    setCurrentTime(video.currentTime);
    setIsMuted(video.muted);
    if (autoPlay) {
      video.muted = true;
      video.play().catch(() => {
        /* ignore autoplay restrictions */
      });
    }
  };

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(event.currentTarget.currentTime);
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const position = Math.min(
      Math.max(0, event.clientX - rect.left),
      rect.width,
    );
    const nextTime = (position / rect.width) * duration;
    const video = resolvedRef.current;
    if (!video) return;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  if (!src) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.9)] ${wrapperClassName}`}
    >
      <div
        className={`relative aspect-video bg-black ${className} group`}
        onClick={isNativeVideo && !autoPlay ? togglePlay : undefined}
      >
        {isNativeVideo ? (
          <>
            <video
              ref={resolvedRef}
              src={src}
              poster={thumbnailUrl}
              muted={isMuted}
              autoPlay={autoPlay}
              playsInline
              preload="metadata"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
            />
            {showControls && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  togglePlay();
                }}
                className={`absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-600 bg-slate-950/80 text-white transition hover:border-orange-400 hover:text-orange-300 ${
                  isPlaying
                    ? "opacity-0 group-hover:opacity-100"
                    : "opacity-100"
                }`}
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            )}
          </>
        ) : (
          <>
            <iframe
              src={iframeActive ? src : ""}
              title={title || "Видео"}
              className="w-full h-full"
              allowFullScreen
            />
            {!iframeActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <button
                  type="button"
                  onClick={() => setIframeActive(true)}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-600 bg-slate-900/95 text-white transition hover:border-orange-400 hover:text-orange-300"
                  aria-label="Activate video preview"
                >
                  <PlayIcon />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isNativeVideo && showProgress && (
        <div
          className={`px-4 py-3 ${isPreview ? "bg-slate-950/90" : "bg-slate-900/95"}`}
        >
          <div className="flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-200">
            <span>{formatTime(currentTime)}</span>
            <span className="text-slate-500">/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="mt-3 h-2 w-full cursor-pointer overflow-hidden rounded-full bg-slate-800"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
