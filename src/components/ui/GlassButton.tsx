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
    "text-white/95 bg-white/[0.14] hover:bg-white/[0.2] " +
    "shadow-[0_8px_26px_-12px_rgba(77,124,255,0.65),inset_0_1px_0_rgba(255,255,255,0.28)]",
  glass:
    "text-white/80 hover:text-white bg-white/[0.055] hover:bg-white/[0.11] " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.13)]",
  quiet:
    "text-white/55 hover:text-white/90 bg-transparent hover:bg-white/[0.06]",
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
    variant !== "quiet"
      ? "backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]"
      : ""
  } ${className}`;

  const inner = (
    <>
      {variant === "solid" && (
        <span
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "linear-gradient(120deg, rgba(95,212,232,0.30), rgba(77,124,255,0.34) 48%, rgba(155,123,255,0.30))",
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
