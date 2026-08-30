/**
 * "Bezoekers Special FX" — een eenmalig entree-effect op een publiek profiel.
 *
 * Alles is afhankelijkheidsvrij: DOM-deeltjes met Web Animations, opgeruimd
 * zodra het effect klaar is. `prefers-reduced-motion` schakelt het effect uit.
 */

export type VisitEffect =
  | "none"
  | "confetti"
  | "fireworks"
  | "balloons"
  | "floating_hearts"
  | "sparkles"
  | "falling_stars"
  | "matrix_rain";

export const VISIT_EFFECTS: { id: VisitEffect; label: string; icon: string; hint: string }[] = [
  { id: "none", label: "Geen effect", icon: "🚫", hint: "Rustige, zakelijke entree" },
  { id: "confetti", label: "Confetti Explosie", icon: "🎉", hint: "Lanceringen & feestjes" },
  { id: "fireworks", label: "Vuurwerk Show", icon: "🎆", hint: "Feestelijk" },
  { id: "balloons", label: "Zwevende Ballonnen", icon: "🎈", hint: "Verjaardagen & jubilea" },
  { id: "floating_hearts", label: "Zwevende Hartjes", icon: "💖", hint: "Romantisch / maker liefde" },
  { id: "sparkles", label: "Magische Fonkelingen", icon: "✨", hint: "Luxe & subtiel" },
  { id: "falling_stars", label: "Vallende Sterren", icon: "🌟", hint: "Kosmisch" },
  { id: "matrix_rain", label: "Matrix Code Rain", icon: "🌧️", hint: "Cyberpunk / dev" },
];

export const isVisitEffect = (value: unknown): value is VisitEffect =>
  typeof value === "string" && VISIT_EFFECTS.some((e) => e.id === value);

export const normalizeVisitEffect = (value: unknown): VisitEffect =>
  isVisitEffect(value) ? value : "none";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const CONFETTI_COLORS = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#facc15"];

function layer(): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText =
    "position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:60;contain:strict";
  document.body.appendChild(el);
  return el;
}

function piece(root: HTMLElement, css: string): HTMLSpanElement {
  const s = document.createElement("span");
  s.style.cssText = `position:absolute;display:block;will-change:transform,opacity;${css}`;
  root.appendChild(s);
  return s;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)] as T;

/**
 * Start het gekozen effect één keer. Retourneert een opruimfunctie zodat een
 * component het effect kan afbreken bij unmount of bij een nieuwe test.
 */
export function runVisitEffect(effect: VisitEffect, options?: { force?: boolean }): () => void {
  if (typeof document === "undefined") return () => {};
  if (effect === "none") return () => {};
  if (!options?.force && prefersReducedMotion()) return () => {};

  const root = layer();
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    root.remove();
  };

  const animate = (
    el: HTMLElement,
    frames: Keyframe[],
    duration: number,
    delay = 0,
  ) => {
    const anim = el.animate(frames, {
      duration,
      delay,
      easing: "cubic-bezier(.2,.7,.3,1)",
      fill: "forwards",
    });
    anim.onfinish = () => el.remove();
  };

  const burst = (x: number, y: number, count: number) => {
    for (let i = 0; i < count; i += 1) {
      const size = rand(5, 10);
      const el = piece(
        root,
        `left:${x}px;top:${y}px;width:${size}px;height:${size * rand(0.4, 1)}px;background:${pick(CONFETTI_COLORS)};border-radius:${Math.random() > 0.5 ? "50%" : "1px"}`,
      );
      const angle = rand(0, Math.PI * 2);
      const distance = rand(80, 320);
      animate(
        el,
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance + rand(120, 320)}px) rotate(${rand(-540, 540)}deg)`,
            opacity: 0,
          },
        ],
        rand(1200, 2200),
      );
    }
  };

  const floaters = (glyphs: readonly string[], count: number, fontSize: [number, number]) => {
    for (let i = 0; i < count; i += 1) {
      const el = piece(
        root,
        `left:${rand(2, 94)}vw;bottom:-40px;font-size:${rand(fontSize[0], fontSize[1])}px;line-height:1`,
      );
      el.textContent = pick(glyphs);
      animate(
        el,
        [
          { transform: "translateY(0) translateX(0)", opacity: 0 },
          { transform: `translateY(-55vh) translateX(${rand(-40, 40)}px)`, opacity: 1, offset: 0.3 },
          { transform: `translateY(-115vh) translateX(${rand(-80, 80)}px)`, opacity: 0 },
        ],
        rand(4200, 7000),
        rand(0, 1200),
      );
    }
  };

  const fallers = (render: (el: HTMLSpanElement) => void, count: number) => {
    for (let i = 0; i < count; i += 1) {
      const el = piece(root, `left:${rand(0, 98)}vw;top:-60px`);
      render(el);
      animate(
        el,
        [
          { transform: "translateY(0)", opacity: 0 },
          { transform: "translateY(20vh)", opacity: 1, offset: 0.15 },
          { transform: "translateY(110vh)", opacity: 0 },
        ],
        rand(2600, 5200),
        rand(0, 1600),
      );
    }
  };

  switch (effect) {
    case "confetti":
      burst(window.innerWidth / 2, window.innerHeight * 0.32, 120);
      window.setTimeout(() => burst(window.innerWidth * 0.25, window.innerHeight * 0.4, 60), 220);
      window.setTimeout(() => burst(window.innerWidth * 0.75, window.innerHeight * 0.4, 60), 380);
      break;
    case "fireworks":
      for (let i = 0; i < 5; i += 1) {
        window.setTimeout(
          () => burst(rand(0.15, 0.85) * window.innerWidth, rand(0.15, 0.5) * window.innerHeight, 70),
          i * 450,
        );
      }
      break;
    case "balloons":
      floaters(["🎈"], 14, [26, 46]);
      break;
    case "floating_hearts":
      floaters(["💖", "💗", "❤️"], 18, [16, 34]);
      break;
    case "sparkles":
      floaters(["✨", "⭐️", "🌟"], 22, [12, 24]);
      break;
    case "falling_stars":
      fallers((el) => {
        el.textContent = "🌟";
        el.style.fontSize = `${rand(12, 26)}px`;
      }, 26);
      break;
    case "matrix_rain":
      fallers((el) => {
        const glyphs = "01アイウエオカキクケコサシスセソ";
        el.textContent = Array.from({ length: Math.floor(rand(4, 12)) })
          .map(() => pick([...glyphs]))
          .join("");
        el.style.cssText += `writing-mode:vertical-rl;color:#22c55e;font-family:ui-monospace,monospace;font-size:${rand(10, 16)}px;text-shadow:0 0 8px #22c55e`;
      }, 34);
      break;
    default:
      break;
  }

  const timer = window.setTimeout(cleanup, 9000);
  return () => {
    window.clearTimeout(timer);
    cleanup();
  };
}
