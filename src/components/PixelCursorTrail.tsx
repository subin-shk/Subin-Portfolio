import { useEffect, useRef } from "react";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#38bdf8", "#818cf8"];

interface Pixel { x: number; y: number; opacity: number; color: string; }

const PixelCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixels = useRef<Pixel[]>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const parent = canvas.parentElement!;

    const resize = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      if (
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom
      ) return;
      const size = 6;
      pixels.current.push({
        x: Math.floor((e.clientX - rect.left) / size) * size,
        y: Math.floor((e.clientY - rect.top)  / size) * size,
        opacity: 0.55,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pixels.current = pixels.current.filter((p) => p.opacity > 0.02);
      for (const p of pixels.current) {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 6, 6);
        p.opacity *= 0.85;
      }
      ctx.globalAlpha = 1;
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
};

export default PixelCursorTrail;
