import { useEffect, useState, type ReactNode } from "react";

// The prototype is laid out for a laptop-sized canvas. Rather than rewriting every
// fixed-pixel panel/font across nine frames, we scale that canvas uniformly to fit
// whatever viewport it's opened in — phone or laptop — so every element shrinks or
// grows together and nothing overflows or becomes illegibly small.
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 800;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.15;
const PHONE_BREAKPOINT = 900;

interface Stage {
  scale: number;
  rotate: boolean;
}

function computeStage(): Stage {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // A phone held in portrait gets the prototype rotated into landscape so it always
  // opens horizontally (e.g. when scanning a QR code on a handset).
  const rotate = w <= PHONE_BREAKPOINT && h > w;
  const viewW = rotate ? h : w;
  const viewH = rotate ? w : h;

  const raw = Math.min(viewW / DESIGN_WIDTH, viewH / DESIGN_HEIGHT);
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, raw));
  return { scale, rotate };
}

export function ResponsiveStage({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>(computeStage);

  useEffect(() => {
    const onResize = () => setStage(computeStage());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const transform = stage.rotate
    ? `translate(-50%, -50%) rotate(90deg) scale(${stage.scale})`
    : `translate(-50%, -50%) scale(${stage.scale})`;

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#e5e7eb" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
