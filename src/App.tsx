// import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Achievements from "./components/Achievements";
import Education from "./components/Education";
import Skills from "./components/Skills";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
      <Header />
      <Hero />
      <About />
      <Experience />
      <Achievements />
      <Education />
      <Skills />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;
