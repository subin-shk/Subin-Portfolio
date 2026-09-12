import type {
  Experience,
  Achievement,
  Education,
  NavItem,
  SkillGroup,
  FeaturedProject,
  ArchiveProject,
  Testimonial,
} from "../types";
import cloverEmporium from "../images/projects/clover_emporium.png";
import masteriyoLms from "../images/projects/masteriyo-lms.webp";
import myDemoApp from "../images/projects/mydemoapp-android.webp";
import trelloBoard from "../images/projects/trello-board.webp";
import faceTune from "../images/projects/face_tune.png";
import amritKumarShrestha from "../images/amrit_kumar_shrestha.jpg";
import aarzuAwal from "../images/aarzu_awal.jpg";

// Labels live only in the dock, so the page body never announces its structure.
export const navigationItems: NavItem[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Journey", href: "#journey" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

export const personalInfo = {
  name: "Subin Shakya",
  title: "Software QA Engineer",
  tagline:
    "Building reliable software through automation, precision, and modern quality engineering.",
  email: "subinshakya.work@gmail.com",
  location: "Kathmandu, Nepal",
  /**
   * ACTION REQUIRED — drop your CV at `public/Subin-Shakya-Resume.pdf`.
   * The only PDFs in this repo were test invoices, not a resume, so nothing
   * is staged here. Until the file exists the hero shows a "Resume on
   * request" mailto instead of a download that would 404.
   */
  resume: "/Subin-Shakya-Resume.pdf",
  hasResume: false,
  summary: `Specialising in automated testing across web, mobile, and API layers with Selenium, Appium, Robot Framework, and Postman.`,
  socialLinks: {
    linkedin: "https://linkedin.com/in/subinshk",
    github: "https://github.com/subin-shk",
  },
};

// Each beat opens a movement in place of a heading, picking up the sentence
// the previous movement left hanging.
export const seo = {
  title: "Subin Shakya | Software QA Engineer | Automation & Quality Engineering",
  description:
    "Subin Shakya is a Software QA Engineer in Kathmandu, Nepal, specializing in test automation, quality engineering, and software reliability.",
  keywords: [
    "Subin Shakya",
    "Software QA Engineer",
    "QA Engineer Nepal",
    "Test Automation Engineer",
    "Automation Engineer",
    "Robot Framework",
    "Selenium",
    "Appium",
    "Software Quality Assurance",
    "Kathmandu Nepal",
  ],
  url: "https://www.subinshakya.com.np",
};

export const narrative = {
  about: {
    beat: "Every release carries a <em>promise</em>.",
    body: [
      "I spend my days making sure that promise holds. Based in Kathmandu, I work as a Software QA Engineer — the person between a feature that looks finished and a feature that actually is.",
      "The work is quieter than it sounds. Read the spec, find the edge nobody scoped, write the script that catches it every time from then on. Repeat until the release is boring.",
    ],
  },
  skills: {
    beat: "Kept with a small set of <em>sharp instruments</em>.",
    body: "Each one earns its place by covering a layer the others can't reach.",
  },
  projects: {
    beat: "Sharpened on <em>real systems</em>.",
    body: "Suites that run without me, against apps that change under them.",
  },
  /** Turns the corner from testing systems to having built them. */
  projectsAside: {
    beat: "Though it doesn't stop at <em>breaking things</em>.",
    body: "Some of these I designed and shipped end to end. Knowing how software gets built is most of knowing where it gives way.",
  },
  journey: {
    beat: "Built one <em>deliberate step</em> at a time.",
    body: "Where the practice came from, and where it's going.",
  },
  achievements: {
    beat: "With a few moments worth <em>keeping</em>.",
    body: "Competition, community, and the occasional certificate.",
  },
  testimonials: {
    beat: "What they <em>said</em>.",
    body: "From people I've shipped alongside.",
  },
  contact: {
    beat: "Let's build something <em>amazing</em>.",
    body: "Have a product that needs to hold up under pressure? I'd like to hear about it.",
  },
};

// Grouped exactly as the capsules render them.
export const skillGroups: SkillGroup[] = [
  {
    id: "automation",
    label: "Automation",
    accent: "blue",
    items: [
      { name: "Selenium", note: "Web UI" },
      { name: "Appium", note: "Mobile" },
      { name: "Robot Framework", note: "Hybrid suites" },
    ],
  },
  {
    id: "api",
    label: "API",
    accent: "cyan",
    items: [{ name: "Postman", note: "Contract & flow" }],
  },
  {
    id: "performance",
    label: "Performance",
    accent: "violet",
    items: [{ name: "JMeter", note: "Load" }],
  },
  {
    id: "bdd",
    label: "BDD",
    accent: "cyan",
    items: [
      { name: "Cucumber", note: "Gherkin specs" },
      { name: "pytest-bdd", note: "Gherkin in Pytest" },
    ],
  },
  {
    id: "programming",
    label: "Programming",
    accent: "violet",
    items: [
      { name: "Java", note: "" },
      { name: "Python", note: "" },
      { name: "SQL", note: "" },
    ],
  },
  {
    id: "vcs",
    label: "Version Control",
    accent: "cyan",
    items: [{ name: "Git", note: "" }],
  },
];

// overview / challenge / solution / impact were drafted from the original
// one-line descriptions: accurate in kind, deliberately unquantified.
export const featuredProjects: FeaturedProject[] = [
  {
    id: "1",
    index: "01",
    strand: "automation",
    name: "Masteriyo LMS Automation",
    kicker: "Robot Framework · WordPress Suite",
    overview:
      "Hybrid UI and API regression suite for Masteriyo LMS, owned end to end at ThemeGrill and extended across the wider catalogue.",
    challenge:
      "The plugin, its themes and WordPress core all move independently. UI-only checks broke constantly.",
    solution:
      "Selenium for the interface, RequestsLibrary for the same flows — failures separate a broken contract from a broken screen.",
    impact:
      "Regression passes that were manual now run unattended across several products.",
    tech: ["Robot Framework", "Selenium", "RequestsLibrary", "Python", "API Testing"],
    image: masteriyoLms,
    imageFit: "float",
    accent: "blue",
  },
  {
    id: "2",
    index: "02",
    strand: "automation",
    name: "MyDemoApp BDD Automation",
    kicker: "Cucumber · Appium",
    overview:
      "Mobile automation for a native shopping app, written as behaviour specs rather than scripts.",
    challenge:
      "Test code drifts away from the acceptance criteria it was written to defend.",
    solution:
      "Appium driven through Cucumber — every scenario is a readable Gherkin spec.",
    impact:
      "Failures name a business rule, not a line number. Non-engineers can read the report.",
    tech: ["Cucumber", "Appium", "BDD", "Gherkin", "Mobile Testing"],
    github: "https://github.com/subin-shk/MyDemoApp-BDD/tree/main/features",
    image: myDemoApp,
    imageFit: "float",
    imageMaxH: "62%",
    accent: "violet",
  },
  {
    id: "3",
    index: "03",
    strand: "automation",
    name: "Trello API Collection",
    kicker: "Postman · REST",
    overview:
      "A Postman collection exercising Trello's REST API across the full lifecycle of a board.",
    challenge:
      "Endpoints are easy to test one at a time, hard to test as a sequence.",
    solution:
      "Chained requests carrying IDs forward, with assertions on status, schema and payload.",
    impact:
      "One run creates, mutates and tears down a board — safe against a live workspace.",
    tech: ["Postman", "REST", "API Testing", "JavaScript", "Assertions"],
    github: "https://github.com/subin-shk/Trello_Postman_Collection",
    image: trelloBoard,
    imageFit: "float",
    accent: "cyan",
  },
  {
    id: "4",
    index: "04",
    strand: "build",
    name: "Clover Emporium",
    kicker: "Full Stack · E-Commerce",
    overview:
      "An e-commerce clothing store built end to end — catalogue, cart, checkout and admin.",
    challenge:
      "Cart state has to survive navigation, refreshes and a login halfway through.",
    solution:
      "PHP and MySQL, with server-side sessions for the cart and parameterised queries throughout.",
    impact:
      "Building what I'd normally be testing is what pushed me toward quality engineering.",
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap", "PHP", "SQL"],
    github: "https://github.com/subin-shk/CloverEmporium",
    image: cloverEmporium,
    imageFit: "plate",
    accent: "violet",
  },
  {
    id: "5",
    index: "05",
    strand: "build",
    name: "Face Tune",
    kicker: "Machine Learning · Flask",
    overview:
      "Real-time facial emotion recognition that reads a mood from a live camera feed and answers it with music.",
    challenge:
      "A classifier that scores well on paper still flickers between states frame to frame.",
    solution:
      "Predictions smoothed across a window of frames behind a Flask service before a mood is committed.",
    impact:
      "Taught me to test probabilistic output — no expected value, only a distribution to hold honest.",
    tech: ["Python", "Flask", "Machine Learning", "JavaScript", "SQLite"],
    github: "https://github.com/subin-shk/FaceTune",
    image: faceTune,
    imageFit: "plate",
    accent: "cyan",
  },
];

/** Everything else, shown as a quiet trailing strip. */
export const archiveProjects: ArchiveProject[] = [
  {
    id: "6",
    name: "Juggle Master",
    description:
      "A VS Code extension that turns the editor into a juggling game. Published on the Marketplace.",
    tech: ["TypeScript", "VS Code API", "WebView", "Canvas API"],
    github: "https://github.com/subin-shk/juggle-master-vs-code",
  },
  {
    id: "8",
    name: "MyDemoApp Automation",
    description:
      "The script-first counterpart to the BDD suite — Mocha and Appium, with a page-object layer.",
    tech: ["Mocha JS", "Appium", "JavaScript"],
    github: "https://github.com/subin-shk/MyDemoApp-Automation",
  },
  {
    id: "9",
    name: "CodeNotes Automation",
    description:
      "Auth and CRUD coverage for a note-taking app, on Pytest fixtures that build the logged-in state once.",
    tech: ["Python", "Pytest", "Selenium"],
    github: "https://github.com/subin-shk/CodeNotes-Automation",
  },
  {
    id: "10",
    name: "Student Management System",
    description:
      "Java Swing desktop client with full CRUD over student records.",
    tech: ["Java", "Swing", "SQL"],
    github:
      "https://github.com/subin-shk/Student-Management-System-in-Java-Swing",
  },
  {
    id: "11",
    name: "Pharmacy Management System",
    description:
      "Inventory and customer records for a pharmacy counter, in Java Swing.",
    tech: ["Java", "Swing", "SQL"],
    github: "https://github.com/subin-shk/Pharmacy-Management-System",
  },
];

// Roles and study on one timeline, newest first.
export const experiences: Experience[] = [
  {
    id: "1",
    role: "Software QA Automation Engineer",
    company: "ThemeGrill Pvt. Ltd.",
    duration: "May 2025 — Present",
    current: true,
    description: [
      "Own and maintain hybrid test automation using Robot Framework (UI + API), improving test coverage and reliability",
      "Conduct integration testing for email marketing, CRM, and payment gateways, ensuring correct configuration and functionality",
      "Collaborate with cross-functional teams to validate features and propose improvements of WordPress themes and plugins",
      "Work closely with developers to maintain quality, report bugs, and meet tight deadlines",
    ],
    skills:
      "Selenium, Robot Framework, RequestsLibrary, PyAutoGUI, Postman, Jira, Manual Testing",
  },
  {
    id: "2",
    role: "Software Quality Assurance Intern",
    company: "Chulo Solutions Pvt. Ltd.",
    duration: "Feb 2025 — May 2025",
    description: [
      "Designed and executed comprehensive test plans for web and mobile applications",
      "Performed API testing and managed test scripts and validations using Postman",
      "Developed and maintained automated test scripts using Python and JavaScript",
      "Identified and tracked software defects using JIRA",
    ],
    skills: "Selenium, Appium, MochaJS, Pytest, Cucumber BDD, Postman, Jira",
  },
];

export const educationHistory: Education[] = [
  {
    id: "1",
    degree: "BSc. Computer Science and Information Technology",
    institution: "National College of Computer Studies — Paknajol, Kathmandu",
    duration: "2021 — 2025",
    grade: "80.71%",
    honors: "Distinction",
  },
  {
    id: "2",
    degree: "High School · +2 Science",
    institution:
      "Trinity International SS & College — Dillibazar, Kathmandu",
    duration: "2018 — 2021",
    grade: "3.61 CGPA",
    honors: "Grade A+",
  },
  {
    id: "3",
    degree: "Secondary Education Examination",
    institution:
      "N.K. Singh Memorial English Preparatory School — New Baneshwor, Kathmandu",
    duration: "2018",
    grade: "3.75 GPA",
    honors: "Grade A+",
  },
];

export const achievements: Achievement[] = [
  {
    id: "1",
    title: "Hackathon Champion",
    context: "NCCS Hackathon Plus+ 2024",
    description:
      "First Runner-Up for a virtual try-on glasses app, built under competition time.",
    metric: "1st",
    metricLabel: "Runner-Up",
    icon: "trophy",
  },
  {
    id: "2",
    title: "GSSoC Extended '24",
    context: "GirlScript Summer of Code",
    description:
      "Ranked 216 of 3,917 participants across the extended programme.",
    metric: "216",
    metricLabel: "of 3,917",
    icon: "award",
  },
  {
    id: "3",
    title: "Frogtoberfest",
    context: "Organised by LeapFrog",
    description:
      "8th overall for sustained open-source contribution through the event month.",
    metric: "8th",
    metricLabel: "Overall",
    icon: "medal",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Aarzu Awal",
    role: "Software Quality Assurance",
    company: "",
    quote:
      "His attention to detail, ability to identify critical issues, and dedication to delivering high-quality software made a significant impact on our team's success. Highly skilled across manual and automation testing, and an excellent team player. I highly recommend Subin for any QA role.",
    image: aarzuAwal,
  },
  {
    id: "2",
    name: "Amrit Kumar Shrestha",
    role: "Technical Support Team Lead | QA Manager",
    company: "",
    quote:
      "I mentored Subin while building the QA team at ThemeGrill, and saw him grow into a confident and capable engineer. A fast learner with real potential, and a positive attitude toward every new challenge. I highly recommend him.",
    image: amritKumarShrestha,
  },
];
