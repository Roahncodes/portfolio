"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  DiscIcon,
  GuestbookIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "@/components/icons";
import { license, songForPath } from "@/content/soundtrack";
import { sound } from "@/lib/audio";

interface TrackItem {
  index: string;
  /** the page, not the song — the song comes from `src/content/soundtrack.ts` */
  title: string;
  path: string;
  badge: string;
}

const TRACKS: TrackItem[] = [
  {
    index: "01",
    title: "Artist Home",
    path: "/",
    badge: "SIDE A",
  },
  {
    index: "02",
    title: "Curiosity & Skills",
    path: "/curiosity",
    badge: "SIDE A",
  },
  {
    index: "03",
    title: "Projects & Discography",
    path: "/projects",
    badge: "STUDIO",
  },
  {
    index: "04",
    title: "JetNet Super-Resolution",
    path: "/projects/jetnet-super-resolution",
    badge: "DEEP CUT",
  },
  {
    index: "05",
    title: "Python Sessions",
    path: "/projects/python-sessions",
    badge: "EXPERIMENTS",
  },
  {
    index: "06",
    title: "Linear Notes & Creds",
    path: "/notes",
    badge: "NOTES",
  },
  {
    index: "07",
    title: "The Paperwork (Resume)",
    path: "/resume",
    badge: "ONE-PAGER",
  },
  {
    index: "08",
    title: "Say Hello",
    path: "/connect",
    badge: "DIRECT",
  },
];

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PlayerDock() {
  const router = useRouter();
  const pathname = usePathname();

  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loopCurrent, setLoopCurrent] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  // The clock belongs to a source. Keeping the source in the same state means
  // a route change resets the readout by derivation, not by a setState effect.
  const [audioClock, setAudioClock] = useState<{ src: string; time: number; duration: number }>({
    src: "",
    time: 0,
    duration: 0,
  });

  const progressTrackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Read by the audio source effect; a ref keeps it out of that effect's deps,
  // so pausing does not immediately call play() again.
  const isPlayingRef = useRef(false);
  // Float position for the auto-scroll ticker, and the moment Play was pressed
  // (so leftover trackpad momentum does not immediately pause it again).
  const scrollPosRef = useRef(0);
  const playStartedAt = useRef(0);

  // Active section based on current path. Longest match wins, otherwise the
  // project detail pages would be masked by `/projects`.
  const currentTrackIndex = TRACKS.reduce((best, track, index) => {
    const matches =
      track.path === "/"
        ? pathname === "/"
        : pathname === track.path || pathname.startsWith(`${track.path}/`);
    if (!matches) return best;
    return track.path.length > TRACKS[best].path.length ? index : best;
  }, 0);
  const currentTrack = TRACKS[currentTrackIndex] || TRACKS[0];
  const currentSong = songForPath(currentTrack.path);
  const clockIsCurrent = audioClock.src === currentSong.src;
  const audioTime = clockIsCurrent ? audioClock.time : 0;
  const audioDuration = clockIsCurrent ? audioClock.duration : 0;

  const soundEnabled = useSyncExternalStore(
    useCallback((onStoreChange) => sound.subscribe(onStoreChange), []),
    () => sound.isEnabled(),
    () => false
  );

  const stopPlayback = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    audioRef.current?.pause();
  }, []);

  // Keep the ref in step with state changes that did not go through Play/Pause
  // (reaching the end of the page, the end of a track, a blocked autoplay).
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Swapping records mid-play should keep playing (a click on Next is still a
  // user gesture); only a page that was paused stays paused.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.55;
    if (!isPlayingRef.current) return;
    void audio.play().catch(() => {
      isPlayingRef.current = false;
      setIsPlaying(false);
    });
  }, [currentSong.src]);

  // Track window scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (isScrubbing) return;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = Math.min(1, Math.max(0, window.scrollY / docHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrubbing, pathname]);

  // Auto-scroll loop when "Playing".
  //
  // This drives the scroll itself instead of relying on scrollBy + RAF:
  // the page sets `scroll-behavior: smooth`, so a scrollBy every frame started
  // a fresh smooth animation that the next frame cancelled — the page barely
  // moved, which made Play look broken. RAF is also paused in background tabs.
  // A pointer-tracking timer with `behavior: "instant"` is immune to both.
  useEffect(() => {
    if (!isPlaying) return;

    // This effect is keyed to a route: navigating mid-play starts a fresh pass
    // from the new page's top instead of carrying the old page's offset across.
    const route = pathname;
    const speedPxPerSec = 64; // comfortable reading pace
    scrollPosRef.current = window.scrollY;
    let last = performance.now();

    const tick = () => {
      if (window.location.pathname !== route) return;
      const now = performance.now();
      const elapsed = Math.min(0.25, (now - last) / 1000);
      last = now;

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      // A page shorter than the viewport has nowhere to scroll; keep the
      // soundtrack going instead of treating it as a finished pass.
      if (maxScroll <= 0) return;

      if (scrollPosRef.current >= maxScroll - 1) {
        if (loopCurrent) {
          scrollPosRef.current = 0;
          last = performance.now();
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        // With loop off the reading pass is over, but the record is not:
        // let it play out. `onEnded`, Pause or a manual scroll stops it.
        return;
      }

      scrollPosRef.current = Math.min(maxScroll, scrollPosRef.current + speedPxPerSec * elapsed);
      window.scrollTo({ top: scrollPosRef.current, behavior: "instant" });
    };

    const timer = window.setInterval(tick, 33);
    return () => window.clearInterval(timer);
  }, [isPlaying, loopCurrent, pathname]);

  // Manual scrolling pauses auto-play. Ignore the first 350ms after Play so
  // trackpad inertia from the click does not stop it instantly, and ignore
  // wheel/touch inside the dock so its own buttons keep working on touch.
  useEffect(() => {
    const onUserInteraction = (e: WheelEvent | TouchEvent) => {
      if (!isPlaying || !e.isTrusted) return;
      if (performance.now() - playStartedAt.current < 350) return;
      if (e.target instanceof Element && e.target.closest(".player-dock")) return;
      stopPlayback();
    };
    window.addEventListener("wheel", onUserInteraction, { passive: true });
    window.addEventListener("touchstart", onUserInteraction, { passive: true });
    return () => {
      window.removeEventListener("wheel", onUserInteraction);
      window.removeEventListener("touchstart", onUserInteraction);
    };
  }, [isPlaying, stopPlayback]);

  // Navigation handlers
  const navigateToTrack = useCallback(
    (index: number) => {
      const nextIndex = (index + TRACKS.length) % TRACKS.length;
      const target = TRACKS[nextIndex];
      sound.playTrackSwitch();
      // Keep the record spinning; the source effect starts the next song.
      router.push(target.path);
    },
    [router]
  );

  const handlePrev = useCallback(() => {
    navigateToTrack(currentTrackIndex - 1);
  }, [currentTrackIndex, navigateToTrack]);

  const handleNext = useCallback(() => {
    navigateToTrack(currentTrackIndex + 1);
  }, [currentTrackIndex, navigateToTrack]);

  const handleShuffle = useCallback(() => {
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * TRACKS.length);
    } while (nextIndex === currentTrackIndex && TRACKS.length > 1);
    navigateToTrack(nextIndex);
  }, [currentTrackIndex, navigateToTrack]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      sound.playClick();
      return;
    }

    // Play at the bottom starts a new pass rather than stopping on the first
    // tick. The record starts over with the page so they leave together.
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (maxScroll > 0 && window.scrollY >= maxScroll - 2) {
      scrollPosRef.current = 0;
      window.scrollTo({ top: 0, behavior: "instant" });
      if (audioRef.current) audioRef.current.currentTime = 0;
      setAudioClock((clock) => ({ ...clock, time: 0 }));
    }

    playStartedAt.current = performance.now();
    isPlayingRef.current = true;
    setIsPlaying(true);
    sound.playNeedleDrop();

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.55;
    if (audio.ended) audio.currentTime = 0;
    void audio.play().catch(() => {
      isPlayingRef.current = false;
      setIsPlaying(false);
    });
  }, [isPlaying, stopPlayback]);

  const toggleSound = useCallback(() => {
    sound.toggle();
  }, []);

  // Seek bar scrubber interaction
  const handleSeek = (clientX: number) => {
    if (!progressTrackRef.current) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setScrollProgress(ratio);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollPosRef.current = ratio * docHeight;
    window.scrollTo({
      top: ratio * docHeight,
      behavior: "instant",
    });
    sound.playClick(0.04, 300);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleSeek(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSeek(moveEvent.clientX);
    };
    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      if (e.code === "Space") {
        // Space already activates a focused button or link. Handling it here
        // as well would toggle playback twice.
        if (target?.closest("button, a, [role='button'], summary")) return;
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        toggleSound();
      } else if (e.altKey && e.key === "ArrowRight") {
        handleNext();
      } else if (e.altKey && e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleSound, handleNext, handlePrev]);

  const totalSeconds = Math.round(audioDuration || currentSong.durationSeconds);
  const currentSeconds = Math.min(Math.round(audioTime), totalSeconds);

  return (
    <aside
      className="player-dock"
      aria-label="Portfolio Now Playing Controller"
      role="region"
    >
      <audio
        key={currentSong.src}
        ref={audioRef}
        src={currentSong.src}
        preload="metadata"
        loop={loopCurrent}
        onLoadedMetadata={(event) => {
          const duration = event.currentTarget.duration;
          if (Number.isFinite(duration) && duration > 0) {
            setAudioClock({
              src: currentSong.src,
              time: event.currentTarget.currentTime,
              duration,
            });
          }
        }}
        onTimeUpdate={(event) => {
          const duration = event.currentTarget.duration;
          const time = event.currentTarget.currentTime;
          setAudioClock((clock) => ({
            src: currentSong.src,
            time,
            duration:
              Number.isFinite(duration) && duration > 0
                ? duration
                : clock.src === currentSong.src
                  ? clock.duration
                  : 0,
          }));
        }}
        onEnded={() => {
          if (loopCurrent) return;
          isPlayingRef.current = false;
          setIsPlaying(false);
        }}
      />

      {/* Top Hairline Track Scrubber */}
      <div
        ref={progressTrackRef}
        className="dock-scrubber"
        onMouseDown={handleMouseDown}
        role="slider"
        aria-label="Page reading progress"
        aria-valuenow={Math.round(scrollProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        <div
          className="dock-scrubber-fill"
          style={{ width: `${(scrollProgress * 100).toFixed(2)}%` }}
        />
        <div
          className="dock-scrubber-thumb"
          style={{ left: `${(scrollProgress * 100).toFixed(2)}%` }}
        />
      </div>

      <div className="dock-inner">
        {/* Left: Track Details */}
        <div className="dock-track-info">
          <div
            className={`dock-vinyl ${isPlaying ? "spinning" : ""}`}
            title={`${currentSong.title} — ${currentSong.artist} (${license.name})`}
          >
            <DiscIcon size={28} />
          </div>

          <div className="dock-meta">
            <div className="dock-title-row">
              <span className="dock-track-index mono-sm">{currentTrack.index}</span>
              <span className="dock-title font-semibold">{currentSong.title}</span>
              <span className="dock-badge mono-sm" title={`${license.name} · ${license.attribution}`}>
                {currentTrack.badge}
              </span>
            </div>
            <div className="dock-artist-row mono-sm">
              <span className="dock-album">{currentSong.artist}</span>
              <span className="dock-dot">·</span>
              <span className="dock-artist">{currentTrack.title}</span>
            </div>
          </div>
        </div>

        {/* Center: Controls & Playback Scrubber Bar */}
        <div className="dock-controls">
          <div className="dock-buttons">
            <button
              type="button"
              className="dock-btn dock-btn-subtle"
              onClick={handleShuffle}
              title="Shuffle: Jump to a random track (Alt+S)"
              aria-label="Shuffle track"
            >
              <ShuffleIcon size={14} />
            </button>

            <button
              type="button"
              className="dock-btn"
              onClick={handlePrev}
              title="Previous track (Alt+Left)"
              aria-label="Previous track"
            >
              <SkipBackIcon size={16} />
            </button>

            <button
              type="button"
              className={`dock-btn dock-btn-play ${isPlaying ? "active" : ""}`}
              onClick={togglePlay}
              title={
                isPlaying
                  ? "Pause soundtrack and auto-scroll (Space)"
                  : "Play soundtrack and auto-scroll (Space)"
              }
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon size={16} filled /> : <PlayIcon size={16} filled />}
            </button>

            <button
              type="button"
              className="dock-btn"
              onClick={handleNext}
              title="Next track (Alt+Right)"
              aria-label="Next track"
            >
              <SkipForwardIcon size={16} />
            </button>

            <button
              type="button"
              className={`dock-btn dock-btn-subtle ${loopCurrent ? "active-accent" : ""}`}
              onClick={() => {
                setLoopCurrent(!loopCurrent);
                sound.playClick(0.05, 520);
              }}
              title="Loop the track and page"
              aria-label="Loop current track and page"
            >
              <RepeatIcon size={14} />
            </button>
          </div>

          {/* Time indicator */}
          <div className="dock-time-display mono-sm">
            <span>{formatTime(currentSeconds)}</span>
            <span className="dock-time-sep">/</span>
            <span>{formatTime(totalSeconds)}</span>
            <Link
              href="/connect#soundtrack"
              className="dock-time-hint hidden md:inline"
              style={{ textDecoration: "none" }}
              title={`${license.attribution} — ${license.name}`}
            >
              · {license.name}
            </Link>
          </div>
        </div>

        {/* Right: Sound FX & Guestbook Link */}
        <div className="dock-extras">
          <button
            type="button"
            className={`dock-tool-btn ${soundEnabled ? "sound-on" : ""}`}
            onClick={toggleSound}
            title={soundEnabled ? "SFX Enabled (Press M to mute)" : "SFX Muted (Press M to enable)"}
            aria-label={soundEnabled ? "Mute tactile UI sound" : "Enable tactile UI sound"}
          >
            {soundEnabled ? <VolumeIcon size={16} /> : <VolumeMuteIcon size={16} />}
            <span className="mono-sm hidden sm:inline">
              {soundEnabled ? "SFX ON" : "SFX OFF"}
            </span>
          </button>

          <Link
            href="/connect#guestbook"
            className="dock-guestbook-btn"
            title="I Was Here: Leave your mark in the guestbook"
          >
            <GuestbookIcon size={15} />
            <span className="mono-sm">I was here</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
