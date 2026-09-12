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
  // A dark tint reads as genuinely darker against the near-black page than
  // any amount of white overlay can — white has a brightness floor, a dark
  // tint doesn't.
  solid:
    "text-white bg-[rgba(77,124,255,0.18)] hover:bg-[rgba(77,124,255,0.28)] " +
    "shadow-[0_10px_30px_-10px_rgba(77,124,255,0.55),inset_0_1px_0_rgba(255,255,255,0.2)]",
  glass:
    "text-white/78 hover:text-white bg-[rgba(9,11,17,0.4)] hover:bg-[rgba(9,11,17,0.28)] " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  quiet:
    "text-white/66 hover:text-white/92 bg-transparent hover:bg-[rgba(9,11,17,0.3)]",
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
      ? "md:backdrop-blur-xl md:[-webkit-backdrop-filter:blur(24px)]"
      : ""
  } ${className}`;

  const inner = (
    <>
      {variant === "solid" && (
        <span
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(120deg, rgba(95,212,232,0.16), rgba(77,124,255,0.18) 48%, rgba(155,123,255,0.16))",
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
