"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Captions, ListVideo, Pause, Play, RotateCcw, RotateCw, ScrollText } from "lucide-react";
import type { TranscriptLine, Video, VideoChapter } from "@/types";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { SearchField } from "@/components/common/controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTimestamp } from "./video-meta";

const SPEEDS = [1, 2, 4] as const;

/** Simulated playback clock — advances a local timestamp, no media is loaded. */
export function useSimulatedPlayback(durationSeconds: number) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + 0.25 * speed;
        if (next >= durationSeconds) {
          setPlaying(false);
          return durationSeconds;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, speed, durationSeconds]);

  const seek = useCallback((s: number, autoplay = true) => {
    setTime(Math.max(0, Math.min(durationSeconds, s)));
    if (autoplay) setPlaying(true);
  }, [durationSeconds]);

  const toggle = useCallback(() => {
    if (!playing && time >= durationSeconds) setTime(0);
    setPlaying(!playing);
  }, [playing, time, durationSeconds]);

  const cycleSpeed = useCallback(() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]), []);

  return { time, playing, speed, seek, toggle, cycleSpeed, setPlaying };
}

function activeIndex<T extends { seconds: number }>(items: T[], time: number) {
  let idx = -1;
  for (let i = 0; i < items.length; i++) if (items[i].seconds <= time) idx = i;
  return idx;
}

interface PlayerProps {
  video: Video;
  time: number;
  playing: boolean;
  speed: number;
  onToggle: () => void;
  onSeek: (seconds: number, autoplay?: boolean) => void;
  onCycleSpeed: () => void;
  className?: string;
}

/** Thumbnail-based player with simulated playback, chapter markers and captions from the transcript. */
export function VideoPlayerPlaceholder({ video, time, playing, speed, onToggle, onSeek, onCycleSpeed, className }: PlayerProps) {
  const duration = video.durationSeconds;
  const pct = duration ? (time / duration) * 100 : 0;
  const chapterIdx = activeIndex(video.chapters, time);
  const lineIdx = activeIndex(video.transcript, time);
  const caption = lineIdx >= 0 && time - video.transcript[lineIdx].seconds < 40 ? video.transcript[lineIdx] : null;
  const started = time > 0 || playing;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      onToggle();
    } else if (e.key === "ArrowRight" || e.key === "l") onSeek(time + 10, playing);
    else if (e.key === "ArrowLeft" || e.key === "j") onSeek(time - 10, playing);
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={onKey}
      role="region"
      aria-label={`Preview player for ${video.title}. Space to play or pause, arrow keys to skip 10 seconds.`}
      className={cn("group/player relative overflow-hidden rounded-[20px] bg-navy-950 shadow-lg outline-none ring-offset-2 ring-offset-background focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:rounded-[24px]", className)}
    >
      <div className="relative aspect-video">
        <motion.div className="absolute inset-0" animate={{ scale: playing ? 1.06 : 1 }} transition={{ duration: playing ? 18 : 0.8, ease: "linear" }}>
          <ImageWithFallback src={video.thumbnail} alt={`Video still: ${video.title}`} aspect="size-full" priority sizes="(max-width: 1024px) 100vw, 66vw" />
        </motion.div>
        <div aria-hidden className={cn("absolute inset-0 transition-colors duration-500", started ? "bg-navy-950/35" : "bg-gradient-to-t from-navy-950/80 via-navy-950/25 to-navy-950/10")} />

        {/* top bar */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/60 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
            <span className={cn("size-1.5 rounded-full", playing ? "animate-pulse bg-teal-400" : "bg-white/50")} /> Preview player · simulated playback
          </span>
          {chapterIdx >= 0 && started && (
            <span className="hidden max-w-[45%] truncate rounded-full bg-navy-950/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md sm:inline-block">
              {video.chapters[chapterIdx].title}
            </span>
          )}
        </div>

        {/* centre play */}
        {!playing && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={time > 0 ? "Resume" : "Play"}
            className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-[60%] place-items-center rounded-full bg-white/95 text-navy-950 shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60 sm:size-20"
          >
            <Play className="size-6 translate-x-0.5 fill-current sm:size-8" />
          </button>
        )}
        {playing && <button type="button" onClick={onToggle} aria-label="Pause" className="absolute inset-0 cursor-pointer" />}

        {/* caption */}
        {caption && started && (
          <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-4 sm:bottom-20">
            <p className="max-w-[90%] rounded-[8px] bg-navy-950/75 px-3 py-1.5 text-center text-[12px] leading-snug text-white backdrop-blur sm:max-w-[75%] sm:text-[15px]">
              {caption.text}
            </p>
          </div>
        )}

        {/* controls */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent px-3 pb-2.5 pt-8 sm:px-4 sm:pb-3">
          <div className="relative h-4">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/20 transition-[height] group-hover/player:h-1.5">
              <div className="h-full rounded-full bg-teal-400" style={{ width: `${pct}%` }} />
            </div>
            {video.chapters.slice(1).map((c) => (
              <span key={c.seconds} aria-hidden className="absolute top-1/2 h-2.5 w-[2px] -translate-y-1/2 bg-navy-950/80" style={{ left: `${(c.seconds / duration) * 100}%` }} />
            ))}
            <span aria-hidden className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${pct}%` }} />
            <input
              type="range"
              min={0}
              max={duration}
              step={1}
              value={Math.floor(time)}
              onChange={(e) => onSeek(Number(e.target.value), playing)}
              aria-label="Seek"
              aria-valuetext={`${formatTimestamp(time)} of ${video.duration}`}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-white sm:gap-2">
            <button type="button" onClick={onToggle} aria-label={playing ? "Pause" : "Play"} className="grid size-9 place-items-center rounded-full hover:bg-white/10">
              {playing ? <Pause className="size-4.5 fill-current" /> : <Play className="size-4.5 translate-x-px fill-current" />}
            </button>
            <button type="button" onClick={() => onSeek(time - 10, playing)} aria-label="Back 10 seconds" className="grid size-9 place-items-center rounded-full hover:bg-white/10">
              <RotateCcw className="size-4" />
            </button>
            <button type="button" onClick={() => onSeek(time + 10, playing)} aria-label="Forward 10 seconds" className="grid size-9 place-items-center rounded-full hover:bg-white/10">
              <RotateCw className="size-4" />
            </button>
            <span className="ml-1 text-[12px] font-medium text-white/85 tabular">
              {formatTimestamp(time)} <span className="text-white/50">/ {video.duration}</span>
            </span>
            <button type="button" onClick={onCycleSpeed} aria-label={`Playback speed ${speed}×`} className="ml-auto h-8 rounded-full px-2.5 text-[12px] font-semibold tabular hover:bg-white/10">
              {speed}×
            </button>
            <span className="hidden items-center gap-1 text-[11px] text-white/60 sm:inline-flex">
              <Captions className="size-4" /> On
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoChapters({ chapters, time, onSeek, durationSeconds, className }: { chapters: VideoChapter[]; time: number; onSeek: (seconds: number) => void; durationSeconds: number; className?: string }) {
  const idx = activeIndex(chapters, time);
  return (
    <ol className={cn("space-y-1", className)}>
      {chapters.map((c, i) => {
        const end = chapters[i + 1]?.seconds ?? durationSeconds;
        const active = i === idx;
        const progress = active ? Math.min(1, (time - c.seconds) / Math.max(1, end - c.seconds)) : i < idx ? 1 : 0;
        return (
          <li key={c.seconds}>
            <button
              type="button"
              onClick={() => onSeek(c.seconds)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors",
                active ? "bg-brand-soft/60" : "hover:bg-surface-2",
              )}
            >
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular", active ? "bg-brand text-brand-foreground" : "bg-surface-2 text-muted-foreground group-hover:bg-surface-3")}>{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[14px]", active ? "font-semibold text-foreground" : "font-medium")}>{c.title}</span>
                <span className="mt-1 block h-0.5 overflow-hidden rounded-full bg-surface-3">
                  <span className="block h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
                </span>
              </span>
              <span className="shrink-0 text-[12px] font-medium text-subtle-foreground tabular">{c.time}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function VideoTranscript({ lines, time, onSeek, playing, className }: { lines: TranscriptLine[]; time: number; onSeek: (seconds: number) => void; playing?: boolean; className?: string }) {
  const [query, setQuery] = useState("");
  const idx = activeIndex(lines, time);
  const scroller = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLLIElement | null)[]>([]);
  const q = query.trim().toLowerCase();
  const visible = useMemo(() => lines.map((l, i) => ({ l, i })).filter(({ l }) => !q || l.text.toLowerCase().includes(q)), [lines, q]);

  useEffect(() => {
    if (!playing || q) return;
    const box = scroller.current;
    const el = lineRefs.current[idx];
    if (!box || !el) return;
    box.scrollTo({ top: Math.max(0, el.offsetTop - 16), behavior: "smooth" });
  }, [idx, playing, q]);

  const highlight = (text: string) => {
    if (!q) return text;
    const at = text.toLowerCase().indexOf(q);
    if (at < 0) return text;
    return (
      <>
        {text.slice(0, at)}
        <mark className="rounded-[3px] bg-lime-soft px-0.5 text-lime-soft-foreground">{text.slice(at, at + q.length)}</mark>
        {text.slice(at + q.length)}
      </>
    );
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <SearchField value={query} onChange={setQuery} placeholder="Search transcript" className="mb-3" />
      <div ref={scroller} className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto pr-1">
        {visible.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">No lines mention “{query}”.</p>
        ) : (
          <ul className="space-y-0.5">
            {visible.map(({ l, i }) => {
              const active = i === idx;
              return (
                <li key={`${l.seconds}-${i}`} ref={(el) => { lineRefs.current[i] = el; }}>
                  <button
                    type="button"
                    onClick={() => onSeek(l.seconds)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full gap-3 rounded-[10px] border-l-2 px-3 py-2 text-left transition-colors",
                      active ? "border-brand bg-brand-soft/50" : "border-transparent hover:bg-surface-2",
                    )}
                  >
                    <span className={cn("w-11 shrink-0 pt-px text-[12px] font-semibold tabular", active ? "text-brand-soft-foreground" : "text-subtle-foreground")}>{l.time}</span>
                    <span className="min-w-0">
                      {l.speaker && <span className="block text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">{l.speaker}</span>}
                      <span className={cn("block text-[14px] leading-relaxed", active ? "text-foreground" : "text-muted-foreground")}>{highlight(l.text)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Complete watch experience: player + details slot in the main column, chapters and
 * transcript in a sticky rail (tabs on mobile). All state is local and simulated.
 */
export function VideoWatch({ video, header, details }: { video: Video; header?: React.ReactNode; details?: React.ReactNode }) {
  const pb = useSimulatedPlayback(video.durationSeconds);
  const seekAndPlay = (s: number) => {
    pb.seek(s, true);
  };

  const chapters = <VideoChapters chapters={video.chapters} time={pb.time} onSeek={seekAndPlay} durationSeconds={video.durationSeconds} />;
  const transcript = (h: string) => <VideoTranscript lines={video.transcript} time={pb.time} onSeek={seekAndPlay} playing={pb.playing} className={h} />;
  const heading = (icon: React.ReactNode, label: string, meta: string) => (
    <h2 className="mb-3 flex items-center gap-2 px-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
      {icon} {label} <span className="ml-auto font-medium normal-case tracking-normal tabular">{meta}</span>
    </h2>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-6">
        <VideoPlayerPlaceholder video={video} time={pb.time} playing={pb.playing} speed={pb.speed} onToggle={pb.toggle} onSeek={pb.seek} onCycleSpeed={pb.cycleSpeed} />
        {header}
        <div className="rounded-[20px] border border-border bg-card p-3 shadow-xs sm:p-4 lg:hidden">
          <Tabs defaultValue="chapters">
            <TabsList className="w-full">
              <TabsTrigger value="chapters" className="flex-1">
                <ListVideo /> Chapters <span className="text-subtle-foreground tabular">{video.chapters.length}</span>
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex-1">
                <ScrollText /> Transcript
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chapters" className="mt-3">
              {chapters}
            </TabsContent>
            <TabsContent value="transcript" className="mt-3">
              {transcript("h-[420px]")}
            </TabsContent>
          </Tabs>
        </div>
        {details}
      </div>
      <aside aria-label="Chapters and transcript" className="hidden space-y-5 lg:block">
        <section className="rounded-[20px] border border-border bg-card p-4 shadow-xs">
          {heading(<ListVideo className="size-4" />, "Chapters", `${video.chapters.length} · ${video.duration}`)}
          {chapters}
        </section>
        <section className="sticky top-24 flex h-[min(560px,calc(100dvh-8rem))] flex-col rounded-[20px] border border-border bg-card p-4 shadow-xs">
          {heading(<ScrollText className="size-4" />, "Transcript", `${video.transcript.length} lines`)}
          {transcript("min-h-0 flex-1")}
        </section>
      </aside>
    </div>
  );
}
