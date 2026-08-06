/** Accent ramps available to cards and capsules. */
export type Accent = "blue" | "cyan" | "violet";

export interface NavItem {
  name: string;
  href: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string[];
  skills: string;
  /** Marks the milestone the timeline keeps lit. */
  current?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  /** Where it happened — rendered under the title. */
  context: string;
  description: string;
  /** Large figure on the award face, e.g. "216". */
  metric: string;
  metricLabel: string;
  icon: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  duration: string;
  grade: string;
  honors?: string;
}

export interface SkillItem {
  name: string;
  /** Short qualifier shown on hover. */
  note: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  accent: Accent;
  items: SkillItem[];
}

export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

export interface FeaturedProject {
  id: string;
  /** Zero-padded ordinal shown in the corner. */
  index: string;
  /**
   * Which half of the stack this belongs to. The first `build` project is
   * preceded by an interstitial beat, so the shift from testing systems to
   * building them reads as a turn in the story rather than a jump.
   */
  strand: "automation" | "build";
  name: string;
  kicker: string;
  overview: string;
  challenge: string;
  solution: string;
  impact: string;
  tech: string[];
  github?: string;
  liveDemo?: string;
  image?: string;
  /**
   * How the image is mounted. `plate` insets an opaque screenshot in a
   * framed panel; `float` drops a cut-out product shot straight onto the
   * accent field, which only works when the PNG carries real alpha.
   */
  imageFit?: "plate" | "float";
  /**
   * Optional override for the max height of a float image, as a CSS value
   * (e.g. "60%"). Defaults to `max-h-full` when not set.
   */
  imageMaxH?: string;
  accent: Accent;
}

export interface ArchiveProject {
  id: string;
  name: string;
  description: string;
  tech: string[];
  github?: string;
}
