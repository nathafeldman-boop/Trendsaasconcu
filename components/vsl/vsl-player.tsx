"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, Check, Lock, Pause, Play, RotateCcw } from "lucide-react";
import type { CameraKey, Device, Film, ScreenScene, TitleScene } from "@/lib/vsl/types";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

// A "film" of real app screenshots: a camera dollies, pans and tilts over
// each screen while the page scrolls inside its device, a cursor clicks,
// highlights and callouts point at what matters and captions tell the
// story. Everything moves from one clock (film time, in seconds) written
// straight to the DOM each frame, so React only re-renders between scenes.

const DEVICES: Record<Device, { screenW: number; screenH: number; chrome: number; pad: number; imageX: number; imageW: number }> = {
  browser: { screenW: 1440, screenH: 900, chrome: 44, pad: 0, imageX: 288, imageW: 1152 },
  phone: { screenW: 390, screenH: 844, chrome: 0, pad: 14, imageX: 0, imageW: 390 },
};

type Cta = { label: string; href?: string; onClick?: () => void };

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

type FullKey = Required<CameraKey>;

/** Fills every keyframe with the previous one's values (or the defaults). */
function fullKeys(keys: CameraKey[], device: Device): FullKey[] {
  const d = DEVICES[device];
  let previous: FullKey = { t: 0, x: d.screenW / 2, y: d.screenH / 2, zoom: 1, scroll: 0, tiltX: 0, tiltY: 0 };
  return [...keys]
    .sort((a, b) => a.t - b.t)
    .map((key) => {
      // Back to the screen's center when a key zooms out without a focus.
      const recenter = key.x === undefined && key.y === undefined && key.zoom !== undefined && key.zoom <= 1.12;
      previous = {
        ...previous,
        ...(recenter ? { x: d.screenW / 2, y: d.screenH / 2 } : {}),
        tiltX: 0,
        tiltY: 0,
        ...key,
      } as FullKey;
      return previous;
    });
}

function sample<T extends { t: number }>(keys: T[], t: number, mix: (a: T, b: T, k: number) => T): T {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) return mix(a, b, ease(clamp01((t - a.t) / Math.max(0.0001, b.t - a.t))));
  }
  return keys[keys.length - 1];
}

const mixCamera = (a: FullKey, b: FullKey, k: number): FullKey => ({
  t: 0,
  x: lerp(a.x, b.x, k),
  y: lerp(a.y, b.y, k),
  zoom: lerp(a.zoom, b.zoom, k),
  scroll: lerp(a.scroll, b.scroll, k),
  tiltX: lerp(a.tiltX, b.tiltX, k),
  tiltY: lerp(a.tiltY, b.tiltY, k),
});

/** Fade in/out over a window of the scene (`fade` in scene fractions). */
function windowOpacity(t: number, from: number, to: number, fade: number) {
  return clamp01(Math.min((t - from) / fade, (to - t) / fade + (to >= 1 ? 1 : 0)));
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: width, h: height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

function Words({ text, size, delay = 0 }: { text: string; size: number; delay?: number }) {
  // *word* (one or several words) gets the accent.
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  let index = 0;
  return (
    <span style={{ fontSize: size }}>
      {parts.map((part, p) => {
        const accent = part.startsWith("*");
        return part
          .replace(/\*/g, "")
          .split(" ")
          .filter(Boolean)
          .map((word, w) => {
            const i = index++;
            return (
              <motion.span
                key={`${p}-${w}`}
                initial={{ opacity: 0, y: "0.35em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.45, delay: delay + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "inline-block whitespace-pre",
                  accent && "font-serif italic text-accent [text-shadow:0_0_24px_rgba(51,244,239,0.45)]"
                )}
              >
                {word}{" "}
              </motion.span>
            );
          });
      })}
    </span>
  );
}

// ───────── Screen scene

function ScreenView({ scene, clock, start, stage, reduced }: { scene: ScreenScene; clock: MotionValue<number>; start: number; stage: { w: number; h: number }; reduced: boolean }) {
  const d = DEVICES[scene.device];
  const keys = useMemo(() => fullKeys(scene.camera, scene.device), [scene]);
  const cursorKeys = scene.cursor;
  const worldRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const highlightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const calloutRefs = useRef<(HTMLDivElement | null)[]>([]);

  const worldW = d.screenW + d.pad * 2;
  const worldH = d.screenH + d.chrome + d.pad * 2;
  const portrait = stage.h > stage.w;

  const render = useCallback(
    (time: number) => {
      const world = worldRef.current;
      if (!world || !stage.w) return;
      const t = reduced ? 1 : clamp01((time - start) / scene.seconds);

      const cam = sample(keys, t, mixCamera);
      const fit = Math.min((stage.w * (portrait ? 0.94 : 0.8)) / worldW, (stage.h * (portrait ? 0.78 : 0.8)) / worldH);
      // A desktop screen in a portrait frame would be unreadable whole.
      const boost = portrait && scene.device === "browser" ? 1.85 : 1;
      const scale = fit * cam.zoom * boost;
      const wx = d.pad + cam.x;
      const wy = d.pad + d.chrome + cam.y;
      // Keep the focus slightly above center: captions live at the bottom.
      const cy = stage.h * (portrait ? 0.42 : 0.46);
      world.style.transformOrigin = `${wx}px ${wy}px`;
      world.style.transform = `translate(${stage.w / 2 - wx}px, ${cy - wy}px) scale(${scale}) rotateX(${cam.tiltX}deg) rotateY(${cam.tiltY}deg)`;
      if (pageRef.current) pageRef.current.style.transform = `translateY(${-cam.scroll}px)`;

      if (cursorKeys?.length && cursorRef.current) {
        const first = cursorKeys[0].t;
        const pos = sample(cursorKeys, t, (a, b, k) => ({ t: 0, x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) }));
        cursorRef.current.style.opacity = reduced ? "0" : String(clamp01((t - first) / 0.06));
        cursorRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        const click = [...cursorKeys].reverse().find((k) => k.click && k.t <= t);
        const since = click ? (t - click.t) * scene.seconds : Infinity;
        if (pointerRef.current) pointerRef.current.style.transform = `scale(${since < 0.18 ? 0.82 : 1})`;
        if (rippleRef.current) {
          const k = clamp01(since / 0.65);
          rippleRef.current.style.opacity = since < 0.65 ? String(1 - k) : "0";
          rippleRef.current.style.transform = `translate(-50%, -50%) scale(${0.3 + k * 1.9})`;
        }
      }

      const fade = 0.3 / scene.seconds;
      scene.highlights?.forEach((h, i) => {
        const el = highlightRefs.current[i];
        if (el) el.style.opacity = String(reduced ? 1 : windowOpacity(t, h.from, h.to, fade));
      });
      scene.callouts?.forEach((c, i) => {
        const el = calloutRefs.current[i];
        if (!el) return;
        const o = reduced ? 1 : windowOpacity(t, c.from, c.to, fade);
        el.style.opacity = String(o);
        el.style.transform = `${c.align === "right" ? "translate(-100%, -50%)" : "translate(-50%, -50%)"} translateY(${(1 - o) * 14}px) scale(${0.92 + o * 0.08})`;
      });
    },
    [keys, cursorKeys, scene, start, stage, portrait, reduced, worldW, worldH, d]
  );

  useMotionValueEvent(clock, "change", render);
  useEffect(() => render(clock.get()), [render, clock]);

  const calloutSize = scene.device === "browser" ? 22 : 16;

  return (
    <>
      {/* The screen itself, blurred, as the ambient light of the frame. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <Image src={scene.image} alt="" fill sizes="10vw" unoptimized className="scale-125 object-cover object-top opacity-25 blur-3xl" />
      </div>

      <div className="absolute inset-0 [perspective:2200px]">
        <div ref={worldRef} className="absolute left-0 top-0 will-change-transform" style={{ width: worldW, height: worldH }}>
          {scene.device === "browser" ? (
            <div className="absolute inset-0 overflow-hidden rounded-[18px] border border-white/12 bg-[#0b0b0c] shadow-[0_60px_140px_-40px_rgba(0,0,0,0.95),0_0_120px_-50px_var(--color-accent)]">
              <div className="flex items-center gap-2 border-b border-white/8 bg-[#141416] px-5" style={{ height: d.chrome }}>
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
                <span className="mx-auto flex h-7 w-[420px] items-center justify-center gap-2 rounded-lg bg-white/[0.06] font-body text-[14px] text-white/55">
                  <Lock className="size-3" />
                  {scene.url}
                </span>
              </div>
              <div className="relative" style={{ height: d.screenH }}>
                {scene.sidebar ? (
                  <Image src={scene.sidebar} alt="" width={d.imageX} height={d.screenH} unoptimized className="absolute left-0 top-0 h-full w-[288px]" />
                ) : null}
                <div className="absolute top-0 overflow-hidden" style={{ left: d.imageX, width: d.imageW, height: d.screenH }}>
                  <PageLayer scene={scene} pageRef={pageRef} cursorRef={cursorRef} pointerRef={pointerRef} rippleRef={rippleRef} highlightRefs={highlightRefs} calloutRefs={calloutRefs} calloutSize={calloutSize} />
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 rounded-[62px] border border-white/15 bg-[#0a0a0b] shadow-[0_60px_140px_-40px_rgba(0,0,0,0.95),0_0_120px_-50px_var(--color-accent),inset_0_0_0_2px_rgba(255,255,255,0.04)]" style={{ padding: d.pad }}>
              <div className="relative h-full w-full overflow-hidden rounded-[50px]">
                <PageLayer scene={scene} pageRef={pageRef} cursorRef={cursorRef} pointerRef={pointerRef} rippleRef={rippleRef} highlightRefs={highlightRefs} calloutRefs={calloutRefs} calloutSize={calloutSize} />
                <span aria-hidden className="absolute left-1/2 top-3 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-black" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PageLayer({
  scene,
  pageRef,
  cursorRef,
  pointerRef,
  rippleRef,
  highlightRefs,
  calloutRefs,
  calloutSize,
}: {
  scene: ScreenScene;
  pageRef: React.RefObject<HTMLDivElement | null>;
  cursorRef: React.RefObject<HTMLDivElement | null>;
  pointerRef: React.RefObject<SVGSVGElement | null>;
  rippleRef: React.RefObject<HTMLSpanElement | null>;
  highlightRefs: React.RefObject<(HTMLDivElement | null)[]>;
  calloutRefs: React.RefObject<(HTMLDivElement | null)[]>;
  calloutSize: number;
}) {
  const width = DEVICES[scene.device].imageW;
  return (
    <div ref={pageRef} className="absolute left-0 top-0 will-change-transform" style={{ width, height: scene.imageHeight }}>
      <Image src={scene.image} alt="" width={width} height={scene.imageHeight} unoptimized loading="eager" className="block h-auto w-full" />
      {scene.highlights?.map((h, i) => (
        <div
          key={i}
          ref={(el) => {
            highlightRefs.current[i] = el;
          }}
          className="pointer-events-none absolute rounded-[18px] border-2 border-accent/90 bg-accent/[0.06] opacity-0 shadow-[0_0_0_6px_rgba(51,244,239,0.12),0_0_60px_-6px_rgba(51,244,239,0.65)]"
          style={{ left: h.rect[0], top: h.rect[1], width: h.rect[2], height: h.rect[3] }}
        />
      ))}
      {scene.callouts?.map((c, i) => (
        <div
          key={i}
          ref={(el) => {
            calloutRefs.current[i] = el;
          }}
          className="pointer-events-none absolute flex items-center gap-2 whitespace-nowrap rounded-full bg-accent px-[0.9em] py-[0.45em] font-display font-semibold text-canvas opacity-0 shadow-[0_12px_40px_-8px_rgba(51,244,239,0.8)]"
          style={{ left: c.x, top: c.y, fontSize: calloutSize }}
        >
          <Check className="size-[1em]" strokeWidth={3.5} />
          {c.text}
        </div>
      ))}
      {scene.cursor?.length ? (
        <div ref={cursorRef} className="pointer-events-none absolute left-0 top-0 opacity-0" style={{ width: 0, height: 0 }}>
          <span ref={rippleRef} className="absolute left-0 top-0 size-16 rounded-full border-2 border-white/80 bg-white/20 opacity-0" />
          <svg ref={pointerRef} viewBox="0 0 24 24" className="absolute -left-[3px] -top-[2px] size-9 origin-top-left drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" aria-hidden>
            <path d="M4 2.5 20 13l-7.2 1.3L9 21.5Z" fill="white" stroke="#0b0b0c" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

// ───────── Title cards

// Where the screenshots float behind a title (fractions of the frame, depth in px).
const CARD_LAYOUT = [
  { x: -0.34, y: 0.04, z: -260, r: 24, w: 0.46 },
  { x: 0.31, y: -0.02, z: -160, r: -22, w: 0.2 },
  { x: 0.05, y: 0.3, z: -420, r: 6, w: 0.52 },
];

function TitleView({ scene, clock, start, stage, cta }: { scene: TitleScene; clock: MotionValue<number>; start: number; stage: { w: number; h: number }; cta?: Cta }) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const portrait = stage.h > stage.w;
  const layout = CARD_LAYOUT;

  const render = useCallback(
    (time: number) => {
      const t = clamp01((time - start) / scene.seconds);
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const l = layout[i];
        const drift = (t - 0.5) * 60;
        el.style.transform = `translate(-50%, -50%) translate3d(${l.x * stage.w + drift * (i % 2 ? -1 : 1)}px, ${l.y * stage.h - drift * 0.4}px, ${l.z + t * 120}px) rotateY(${l.r - t * 8}deg) rotateX(${6 - t * 4}deg)`;
      });
    },
    [scene, start, stage, layout]
  );
  useMotionValueEvent(clock, "change", render);
  useEffect(() => render(clock.get()), [render, clock]);

  const titleSize = Math.max(26, Math.min(64, stage.w * (portrait ? 0.085 : 0.052)));

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(51,244,239,0.16),transparent_60%)]" />
      <div className="absolute inset-0 [perspective:1400px]">
        {scene.images?.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 overflow-hidden rounded-[18px] border border-white/15 opacity-80 shadow-[0_40px_120px_-30px_rgba(0,0,0,1),0_0_60px_-30px_var(--color-accent)] will-change-transform"
            style={{
              // Phone screenshots are narrow: same height as their neighbours, not the same width.
              width: stage.w * layout[i].w * (src.includes("onb-") ? 0.42 : 1),
              aspectRatio: src.includes("onb-") ? "390 / 760" : "1152 / 760",
              filter: "blur(1.5px)",
            }}
          >
            <Image src={src} alt="" fill sizes="40vw" unoptimized className="object-cover object-top" />
          </div>
        ))}
      </div>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_center,rgba(9,9,10,0.85),rgba(9,9,10,0.4)_70%,rgba(9,9,10,0.8))]" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="font-display font-medium leading-[1.05] tracking-[-0.04em] text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.8)]">
          <Words text={scene.title} size={titleSize} delay={0.15} />
        </p>
        {scene.sub ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-4 max-w-[34ch] font-body text-ink-muted"
            style={{ fontSize: Math.max(14, titleSize * 0.32) }}
          >
            {scene.sub}
          </motion.p>
        ) : null}
        {scene.kind === "outro" && cta ? (
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, delay: 1 }} className="mt-7">
            <CtaButton cta={cta} />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

function CtaButton({ cta }: { cta: Cta }) {
  const className =
    "relative z-20 inline-flex h-12 items-center gap-2 rounded-pill bg-accent px-6 font-body text-[15px] font-semibold text-canvas shadow-[0_0_40px_-6px_var(--color-accent)] transition-transform hover:scale-[1.03] active:scale-95";
  const onClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    track("vsl_cta_clicked", { label: cta.label });
    cta.onClick?.();
  };
  return cta.href ? (
    <a href={cta.href} onClick={onClick} className={className}>
      {cta.label}
      <ArrowRight className="size-4" />
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {cta.label}
      <ArrowRight className="size-4" />
    </button>
  );
}

// ───────── Player

/** When each scene begins, in film seconds. */
function sceneStarts(film: Film) {
  const starts = [0];
  for (let i = 1; i < film.scenes.length; i++) starts.push(starts[i - 1] + film.scenes[i - 1].seconds);
  return starts;
}

export function VslPlayer({
  film,
  autoPlay = "in-view",
  cta,
  onEnded,
  className,
}: {
  film: Film;
  /** "in-view": starts (silently, there's no sound) once mostly visible. */
  autoPlay?: "in-view" | "now" | "off";
  cta?: Cta;
  onEnded?: () => void;
  className?: string;
}) {
  const reduced = Boolean(useReducedMotion());
  const [stageRef, stage] = useElementSize<HTMLDivElement>();
  const clock = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const userPaused = useRef(false);
  const fillRef = useRef<HTMLSpanElement>(null);

  const starts = useMemo(() => sceneStarts(film), [film]);
  // Consecutive scenes on the same screenshot share a key: no cut between
  // them, the camera simply carries on.
  const shotKeys = useMemo(
    () =>
      film.scenes.map((s, i) => {
        let first = i;
        while (first > 0 && s.kind === "screen" && film.scenes[first - 1].kind === "screen" && (film.scenes[first - 1] as ScreenScene).image === s.image) first--;
        return `${film.scenes[first].id}-${first}`;
      }),
    [film]
  );
  // "01 · Ton idée": numbered by chapter, not by scene.
  const chapterNumbers = useMemo(() => {
    const seen: string[] = [];
    return film.scenes.map((s) => {
      if (s.kind !== "screen") return 0;
      if (!seen.includes(s.chapter)) seen.push(s.chapter);
      return seen.indexOf(s.chapter) + 1;
    });
  }, [film]);
  const total = starts[starts.length - 1] + film.scenes[film.scenes.length - 1].seconds;
  const scene = film.scenes[index];

  const play = useCallback(() => {
    if (ended) {
      clock.set(0);
      setIndex(0);
      setEnded(false);
    }
    if (!started) track("vsl_played", { film: film.id });
    setStarted(true);
    setPlaying(true);
  }, [clock, ended, film.id, started]);

  useAnimationFrame((_, delta) => {
    if (!playing) return;
    const next = clock.get() + Math.min(delta, 64) / 1000;
    if (next >= total) {
      clock.set(total);
      setPlaying(false);
      setEnded(true);
      track("vsl_completed", { film: film.id });
      onEnded?.();
      return;
    }
    clock.set(next);
    let sceneIndex = 0;
    while (sceneIndex + 1 < starts.length && starts[sceneIndex + 1] <= next) sceneIndex++;
    if (sceneIndex !== index) setIndex(sceneIndex);
  });

  // The active chapter's progress bar.
  useMotionValueEvent(clock, "change", (time) => {
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${clamp01((time - starts[index]) / scene.seconds)})`;
  });

  // Plays when it's on screen (unless paused by hand), pauses when it leaves.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || autoPlay === "off" || reduced) return;
    if (autoPlay === "now") {
      const id = window.setTimeout(play, 350);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current && !ended) play();
        else if (!entry.isIntersecting) setPlaying(false);
      },
      { threshold: 0.55 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // play is stable enough here: re-observing on every change would restart the film.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, reduced, ended, stageRef]);

  // Fetch the next screens before they're needed.
  useEffect(() => {
    const next = film.scenes[index + 1];
    const urls = next?.kind === "screen" ? [next.image, next.sidebar] : (next?.images ?? []);
    for (const url of urls) if (url) new window.Image().src = url;
  }, [film, index]);

  function toggle() {
    if (playing) {
      userPaused.current = true;
      setPlaying(false);
    } else {
      userPaused.current = false;
      play();
    }
  }

  function jump(i: number) {
    clock.set(starts[i]);
    setIndex(i);
    setEnded(false);
    userPaused.current = false;
    setStarted(true);
    setPlaying(true);
  }

  const portrait = stage.h > stage.w;
  const captionSize = Math.max(15, Math.min(27, stage.w * (portrait ? 0.047 : 0.024)));

  return (
    <div className={cn("relative", className)}>
      <div
        ref={stageRef}
        role="region"
        aria-label={film.label}
        onClick={toggle}
        className="relative aspect-[4/5] w-full cursor-pointer select-none overflow-hidden rounded-[28px] border border-white/10 bg-[#070708] shadow-[0_40px_120px_-40px_rgba(0,0,0,1),0_0_80px_-40px_var(--color-accent)] sm:aspect-video"
      >
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(51,244,239,0.12),transparent_55%),radial-gradient(ellipse_at_50%_120%,rgba(15,181,177,0.18),transparent_50%)]" />
        <div aria-hidden className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        {stage.w > 0 && (
          <AnimatePresence initial={false}>
            <motion.div
              key={shotKeys[index]}
              className="absolute inset-0"
              initial={{ opacity: 0, filter: "blur(10px)", scale: 1.015 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {scene.kind === "screen" ? (
                <ScreenView scene={scene} clock={clock} start={starts[index]} stage={stage} reduced={reduced} />
              ) : (
                <TitleView scene={scene} clock={clock} start={starts[index]} stage={stage} cta={cta} />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Cinema vignette + caption backdrop. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.75)]" />
        {scene.kind === "screen" && (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/75 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
          </>
        )}

        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 sm:left-6 sm:top-5">
          <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
          <AnimatePresence mode="wait">
            <motion.span
              key={scene.chapter}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/75 sm:text-[11px]"
            >
              {scene.kind === "screen" ? `${String(chapterNumbers[index]).padStart(2, "0")} · ` : ""}
              {scene.chapter}
            </motion.span>
          </AnimatePresence>
        </div>
        {scene.kind === "screen" && scene.badge ? (
          <span className="pointer-events-none absolute left-4 top-10 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/60 backdrop-blur sm:left-auto sm:right-6 sm:top-5">
            {scene.badge}
          </span>
        ) : null}

        {scene.kind === "screen" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center px-5 sm:bottom-16 sm:px-12">
            <p key={scene.id + index} className="max-w-[30ch] text-center font-display font-medium leading-[1.2] tracking-[-0.02em] text-white sm:max-w-[40ch]">
              <Words text={scene.caption} size={captionSize} />
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 pb-4 sm:px-6 sm:pb-5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={ended ? play : toggle}
            aria-label={ended ? "Revoir" : playing ? "Pause" : "Lecture"}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            {ended ? <RotateCcw className="size-3.5" /> : playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 translate-x-px" />}
          </button>
          <div className="flex flex-1 gap-1.5">
            {film.scenes.map((s, i) => (
              <button
                key={s.id + i}
                type="button"
                onClick={() => jump(i)}
                aria-label={`Aller à : ${s.chapter}`}
                className="group h-5 flex-1"
                style={{ flexGrow: s.seconds }}
              >
                <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/20 transition-[height] group-hover:h-[5px]">
                  <span
                    ref={i === index ? fillRef : undefined}
                    className="absolute inset-0 origin-left rounded-full bg-accent"
                    style={{ transform: `scaleX(${i < index || (ended && i === index) ? 1 : 0})` }}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Before the first play (or when motion is reduced). */}
        <AnimatePresence>
          {!started && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <span className="flex size-20 items-center justify-center rounded-full bg-accent text-canvas shadow-[0_0_60px_-4px_var(--color-accent)]">
                <Play className="size-8 translate-x-0.5" fill="currentColor" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
