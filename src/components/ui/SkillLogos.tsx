import type { ComponentType, CSSProperties } from "react";
import { Braces, Database, Feather } from "lucide-react";

import appium from "../../images/logos/appium.svg";
import cucumber from "../../images/logos/cucumber.svg";
import elementor from "../../images/logos/elementor.svg";
import git from "../../images/logos/git.svg";
import github from "../../images/logos/github.svg";
import javascript from "../../images/logos/javascript.svg";
import jira from "../../images/logos/jira.svg";
import locust from "../../images/logos/locust.svg";
import mysql from "../../images/logos/mysql.svg";
import postman from "../../images/logos/postman.svg";
import pytest from "../../images/logos/pytest.svg";
import python from "../../images/logos/python.svg";
import robotframework from "../../images/logos/robotframework.svg";
import selenium from "../../images/logos/selenium.svg";
import themegrill from "../../images/logos/themegrill.png";
import vscode from "../../images/logos/vscode.svg";
import woocommerce from "../../images/logos/woocommerce.svg";
import wordpress from "../../images/logos/wordpress.svg";

/**
 * Brand marks for the bench sheet, keyed by `SkillItem.logo`.
 *
 * They live here rather than in the data file so `portfolioData` stays a
 * plain manifest with no asset imports in it. Every file is a vendored SVG
 * (Devicon's colour originals, or a Simple Icons glyph tinted to the brand's
 * own hex) — none are fetched at runtime, so the sheet renders identically
 * offline and nothing here depends on a CDN staying up.
 */
export const MARKS: Record<string, string> = {
  appium,
  cucumber,
  elementor,
  git,
  github,
  javascript,
  jira,
  locust,
  mysql,
  postman,
  pytest,
  python,
  robotframework,
  selenium,
  themegrill,
  vscode,
  woocommerce,
  wordpress,
};

/* Loose enough to cover a lucide icon, which takes either units. */
type GlyphProps = {
  size?: string | number;
  strokeWidth?: string | number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Drawn fallbacks: two entries that are a protocol and a language rather
 * than a product, plus one whose own mark does not survive being shrunk.
 * A colour here is set by the caller, so these stay in the page's ink
 * unless the brand needs its own.
 */
export const DRAWN: Record<string, ComponentType<GlyphProps>> = {
  rest: Braces,
  sql: Database,
  /* JMeter ships its mark locked to an "APACHE JMeter" wordmark that is
     unreadable beside icon-only logos at this size, so the project is shown
     by the Apache feather it is named for, in JMeter red. */
  jmeter: Feather,
};

/** Brand ink for a drawn glyph. Anything unlisted stays in page ink. */
export const DRAWN_TINT: Record<string, string> = {
  jmeter: "#D22128",
};
