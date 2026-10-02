import { ArrowRight } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { buttonVariants } from "@/components/common/buttonVariants";
import { cn } from "@/utils/cn";

const IMG_W = 1376;
const IMG_H = 768;

type SpaceLayer = {
  box: [number, number, number, number];
  depth: number;
  drift: string;
  dur: string;
  dx: string;
  dy: string;
  name: string;
  rot: string;
};

/**
 * Depth layers cut from the approved artwork (see slice_space.py).
 * depth 0 = far … 1 = near. Still-frame composite is pixel-identical
 * to the original image; motion only appears through drift + parallax.
 */
const SPACE_LAYERS: SpaceLayer[] = [
  { box: [710, 156, 1044, 434], depth: 0.55, drift: "drift-b", dur: "9s", dx: "0px", dy: "10px", name: "helmet", rot: "1.2deg" },
  { box: [732, 58, 898, 178], depth: 0.6, drift: "drift-a", dur: "15s", dx: "-7px", dy: "5px", name: "rock-top", rot: "1.5deg" },
  { box: [1126, 0, 1302, 156], depth: 0.7, drift: "drift-a", dur: "17s", dx: "6px", dy: "7px", name: "rock-tr", rot: "-1.5deg" },
  { box: [1180, 152, 1268, 212], depth: 0.45, drift: "drift-c", dur: "11s", dx: "8px", dy: "-6px", name: "rock-tr-small", rot: "2deg" },
  { box: [1188, 418, 1376, 662], depth: 0.9, drift: "drift-b", dur: "18s", dx: "5px", dy: "-4px", name: "rock-right", rot: "1deg" },
  { box: [0, 58, 142, 642], depth: 1, drift: "drift-b", dur: "20s", dx: "-3px", dy: "3px", name: "rock-left", rot: "0.6deg" },
  { box: [548, 638, 718, 748], depth: 0.65, drift: "drift-a", dur: "14s", dx: "7px", dy: "-5px", name: "rock-bottom", rot: "-1.2deg" },
  { box: [258, 588, 374, 704], depth: 0.5, drift: "drift-c", dur: "8s", dx: "0px", dy: "-8px", name: "gem", rot: "3deg" },
  { box: [946, 176, 992, 224], depth: 0.4, drift: "drift-a", dur: "7s", dx: "9px", dy: "8px", name: "frag-lime", rot: "5deg" },
  { box: [505, 220, 532, 258], depth: 0.3, drift: "drift-c", dur: "9s", dx: "-8px", dy: "7px", name: "frag-pink-1", rot: "-4deg" },
  { box: [556, 212, 602, 272], depth: 0.35, drift: "drift-b", dur: "10s", dx: "7px", dy: "-8px", name: "frag-rock-1", rot: "3deg" },
  { box: [636, 276, 670, 354], depth: 0.4, drift: "drift-a", dur: "8s", dx: "-6px", dy: "9px", name: "frag-bar-1", rot: "-5deg" },
  { box: [488, 556, 530, 614], depth: 0.45, drift: "drift-c", dur: "7.5s", dx: "8px", dy: "-7px", name: "frag-shard-pink", rot: "4deg" },
  { box: [672, 474, 702, 528], depth: 0.35, drift: "drift-b", dur: "9.5s", dx: "-9px", dy: "-6px", name: "frag-chip", rot: "-3deg" },
  { box: [688, 542, 722, 582], depth: 0.3, drift: "drift-a", dur: "11s", dx: "6px", dy: "6px", name: "frag-pebble-dark", rot: "2deg" },
  { box: [1090, 531, 1134, 602], depth: 0.45, drift: "drift-c", dur: "8.5s", dx: "-7px", dy: "8px", name: "frag-bar-2", rot: "-4deg" },
  { box: [1082, 412, 1128, 458], depth: 0.35, drift: "drift-a", dur: "10s", dx: "9px", dy: "-5px", name: "frag-pebble-1", rot: "3deg" },
  { box: [982, 418, 1012, 452], depth: 0.25, drift: "drift-b", dur: "12s", dx: "-5px", dy: "6px", name: "frag-tiny-1", rot: "-2deg" },
  { box: [902, 632, 948, 672], depth: 0.3, drift: "drift-c", dur: "9s", dx: "6px", dy: "-7px", name: "frag-pebble-2", rot: "2.5deg" },
  { box: [168, 422, 202, 478], depth: 0.35, drift: "drift-a", dur: "11.5s", dx: "-7px", dy: "-8px", name: "frag-lav-1", rot: "-3deg" },
  { box: [282, 128, 312, 162], depth: 0.2, drift: "drift-b", dur: "13s", dx: "5px", dy: "7px", name: "frag-tiny-2", rot: "2deg" },
  { box: [1008, 558, 1036, 596], depth: 0.25, drift: "drift-c", dur: "10.5s", dx: "-6px", dy: "-6px", name: "frag-tiny-3", rot: "-2.5deg" },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const spriteRefs = useRef<Array<HTMLDivElement | null>>([]);
  const coverRef = useRef({ ox: 0, oy: 0, s: 1 });
  const navigate = useNavigate();
  const leavingRef = useRef(false);

  // Position sprites with the same cover math as the base image so the
  // still frame aligns pixel-perfect with the approved artwork.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const layout = () => {
      const rect = section.getBoundingClientRect();
      const s = Math.max(rect.width / IMG_W, rect.height / IMG_H);
      const ox = (rect.width - IMG_W * s) / 2;
      const oy = (rect.height - IMG_H * s) / 2;
      coverRef.current = { ox, oy, s };
      spriteRefs.current.forEach((el, i) => {
        if (!el) return;
        const [x0, y0, x1] = SPACE_LAYERS[i].box;
        el.style.left = `${(ox + x0 * s).toFixed(1)}px`;
        el.style.top = `${(oy + y0 * s).toFixed(1)}px`;
        el.style.width = `${((x1 - x0) * s).toFixed(1)}px`;
      });
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // One rAF loop: mouse + scroll parallax with per-layer depth, lerped.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const targets = { mx: 0, my: 0, scroll: window.scrollY };
    let cx = 0;
    let cy = 0;
    let cs = window.scrollY;
    let visible = true;
    let frame = 0;
    const onMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      targets.mx = (event.clientX - rect.left) / rect.width - 0.5;
      targets.my = (event.clientY - rect.top) / rect.height - 0.5;
    };
    const onScroll = () => {
      targets.scroll = window.scrollY;
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(section);
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible || leavingRef.current) return;
      cx += (targets.mx - cx) * 0.06;
      cy += (targets.my - cy) * 0.06;
      cs += (targets.scroll - cs) * 0.08;
      const base = baseRef.current;
      if (base) {
        const { ox, oy, s } = coverRef.current;
        base.style.transform =
          `translate(${(ox + cx * 8).toFixed(2)}px, ` +
          `${(oy + cy * 6 + cs * 0.02).toFixed(2)}px) ` +
          `scale(${s.toFixed(4)})`;
      }
      spriteRefs.current.forEach((el, i) => {
        if (!el) return;
        const depth = SPACE_LAYERS[i].depth;
        el.style.transform =
          `translate3d(${(cx * depth * 30).toFixed(2)}px, ` +
          `${(cy * depth * 20 + cs * depth * 0.05).toFixed(2)}px, 0)`;
      });
    };
    frame = requestAnimationFrame(tick);
    section.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      section.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function handleStartJourney(event: React.MouseEvent) {
    event.preventDefault();
    if (leavingRef.current) return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      navigate("/onboarding");
      return;
    }
    leavingRef.current = true;
    sectionRef.current?.classList.add("space-leaving");
    window.setTimeout(() => navigate("/onboarding"), 1250);
  }

  return (
    <section
      className="relative isolate overflow-hidden bg-[#0e0718] text-white"
      ref={sectionRef}
    >
      {/* Layered artwork: inpainted base + independent sprites */}
      <div
        aria-hidden="true"
        className="space-scene pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-0 top-0 origin-top-left" ref={baseRef}>
          <img
            alt=""
            className="space-base-img block h-[768px] w-[1376px] max-w-none"
            draggable={false}
            src="/images/space/base.png"
          />
        </div>
        {SPACE_LAYERS.map((layer, i) => (
          <div
            className="space-sprite absolute"
            key={layer.name}
            ref={(el) => {
              spriteRefs.current[i] = el;
            }}
            style={{ "--depth": layer.depth } as React.CSSProperties}
          >
            <div className="space-zoom">
              <img
                alt=""
                className={`block w-full ${layer.drift}`}
                draggable={false}
                src={`/images/space/${layer.name}.png`}
                style={
                  {
                    "--dx": layer.dx,
                    "--dy": layer.dy,
                    "--rr": layer.rot,
                    animationDelay: `${-((i * 1.7) % 9).toFixed(1)}s`,
                    animationDuration: layer.dur,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        ))}
        {/* Cinematic fly-through veil */}
        <div className="space-veil pointer-events-none absolute inset-0 bg-[#0e0718] opacity-0" />
      </div>

      {/* Readability scrims: clean visual area behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_52%_at_50%_44%,rgba(14,7,24,0.72),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0e0718]/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#0e0718]"
      />

      <div className="relative mx-auto flex min-h-[100svh] w-[min(100%-2rem,1180px)] flex-col items-center justify-center pb-20 pt-32 text-center sm:pt-36">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-teal-300"
          />
          AI-powered personalized learning
        </p>

        <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          Your learning journey,
          <br />
          guided by AI.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          Learn with a personalized path that adapts to you.
        </p>

        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            className={cn(buttonVariants({ size: "large" }), "w-full sm:w-auto")}
            onClick={handleStartJourney}
            to="/onboarding"
          >
            Start your journey
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            className={cn(
              buttonVariants({ size: "large", variant: "secondary" }),
              "w-full sm:w-auto",
            )}
            href="#features"
          >
            Explore Saarthi
          </a>
        </div>

        <p
          aria-hidden="true"
          className="mt-14 flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          Scroll to explore
          <span className="block h-8 w-px bg-gradient-to-b from-slate-500 to-transparent" />
        </p>
      </div>
    </section>
  );
}
