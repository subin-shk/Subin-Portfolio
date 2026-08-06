import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "../../lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Peak rotation in degrees. 0 disables tilt. */
  tilt?: number;
  /** Track the pointer to move the specular highlight. */
  spotlight?: boolean;
  onClick?: () => void;
};

/**
 * Translucent panel that tilts toward the pointer and carries a
 * cursor-tracked highlight. Tilt happens on a wrapper with perspective so
 * children keep their own stacking context and text stays crisp.
 */
export default function GlassCard({
  children,
  className = "",
  tilt = 7,
  spotlight = true,
  onClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 150, damping: 18, mass: 0.5 };

  const rotateX = useSpring(
    useTransform(py, [0, 1], [tilt, -tilt]),
    spring
  );
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-tilt, tilt]),
    spring
  );

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx);
    py.set(ny);

    if (spotlight) {
      ref.current.style.setProperty("--lx", `${nx * 100}%`);
      ref.current.style.setProperty("--ly", `${ny * 100}%`);
    }
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div style={{ perspective: 1100 }} className="h-full">
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        onClick={onClick}
        style={
          reduced || tilt === 0
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
        className={`group relative h-full gpu ${spotlight ? "lit" : ""} ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
