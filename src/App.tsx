import Atmosphere from "./components/Atmosphere";
import Orb from "./components/Orb";
import Dock from "./components/Dock";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Journey from "./components/Journey";
import Achievements from "./components/Achievements";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Seo from "./components/Seo";
import { useSmoothScroll } from "./lib/useSmoothScroll";

/**
 * One continuous surface. There are no section chrome or dividers between
 * movements — the backdrop is a single fixed layer everything scrolls over,
 * and each movement opens on a narrative beat rather than a heading.
 */
export default function App() {
  useSmoothScroll();

  return (
    <>
      <Seo />
      <Atmosphere />
      <Orb />

      <a
        href="#about"
        className="glass edge sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[200] focus:rounded-full focus:px-5 focus:py-3 focus:text-sm"
      >
        Skip to content
      </a>

      <Dock />

      <main className="relative z-[1]">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Achievements />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
