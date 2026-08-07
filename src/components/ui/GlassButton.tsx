import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  /** `solid` is the single bright call to action per screen. */
  variant?: "solid" | "glass" | "quiet";
  download?: boolean | string;
  external?: boolean;
  className?: string;
  icon?: ReactNode;
  type?: "button" | "submit";
};

const base =
  "relative inline-flex items-center justify-center gap-2.5 rounded-full overflow-hidden " +
  "px-7 py-3.5 text-[0.9rem] font-medium tracking-[-0.01em] " +
  "transition-[background,box-shadow,color] duration-300 ease-glass edge";

const variants: Record<string, string> = {
  solid:
    "text-white/95 bg-white/[0.11] hover:bg-white/[0.16] " +
    "shadow-[0_8px_20px_-12px_rgba(7,12,20,0.9),inset_0_1px_0_rgba(255,255,255,0.16)]",
  glass:
    "text-white/80 hover:text-white bg-white/[0.045] hover:bg-white/[0.08] " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
  quiet:
    "text-white/55 hover:text-white/90 bg-transparent hover:bg-white/[0.05]",
};

/**
 * Glass pill.
 *
 * Hover changes colour and nothing else — no magnetic pull toward the
 * cursor, no sheen sweep, no lift. A button that moves when you approach it
 * is harder to hit than one that doesn't.
 */
export default function GlassButton({
  children,
  href,
  onClick,
  variant = "glass",
  download,
  external,
  className = "",
  icon,
  type = "button",
}: Props) {
  const cls = `${base} ${variants[variant]} ${
    variant !== "quiet" ? "md:backdrop-blur-[8px] md:[-webkit-backdrop-filter:blur(8px)]" : ""
  } ${className}`;

  const inner = (
    <>
      {variant === "solid" && (
        <span
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "linear-gradient(120deg, rgba(95,212,232,0.22), rgba(77,124,255,0.26) 48%, rgba(155,123,255,0.2))",
          }}
        />
      )}
      <span className="relative z-[2] flex items-center gap-2.5">
        {children}
        {icon}
      </span>
    </>
  );

  return href ? (
    <a
      href={href}
      className={cls}
      {...(download ? { download: download === true ? "" : download } : {})}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </a>
  ) : (
    <button type={type} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
