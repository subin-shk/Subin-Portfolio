import type {
  Experience,
  Achievement,
  Education,
  NavItem,
  SkillGroup,
  Stat,
  FeaturedProject,
  ArchiveProject,
} from "../types";
import cloverEmporium from "../images/projects/clover_emporium.png";
import masteriyoLms from "../images/projects/masteriyo-lms.webp";
import myDemoApp from "../images/projects/mydemoapp-android.webp";
import trelloBoard from "../images/projects/trello-board.webp";
import juggleMaster from "../images/projects/juggle-master.png";
import nudge from "../images/projects/nudge.png";
import faceTune from "../images/projects/face_tune.png";

// Labels live only in the dock, so the page body never announces its structure.
export const navigationItems: NavItem[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Journey", href: "#journey" },
  { name: "Achievements", href: "#achievements" },
  { name: "Contact", href: "#contact" },
];

export const personalInfo = {
  name: "Subin Shakya",
  title: "Software QA Engineer",
  tagline:
    "Building reliable software through automation, precision, and modern quality engineering.",
  email: "subin12.shakya@gmail.com",
  location: "Kathmandu, Nepal",
  /**
   * ACTION REQUIRED — drop your CV at `public/Subin-Shakya-Resume.pdf`.
   * The only PDFs in this repo were test invoices, not a resume, so nothing
   * is staged here. Until the file exists the hero shows a "Resume on
   * request" mailto instead of a download that would 404.
   */
  resume: "/Subin-Shakya-Resume.pdf",
  hasResume: false,
  summary: `A dedicated Software Quality Assurance Engineer specialising in automated testing and the processes that keep it dependable. Works across web, mobile, and API layers with Selenium, Appium, Robot Framework, and Postman. Committed to high quality standards and to continuously improving how software is verified before it ships.`,
  socialLinks: {
    linkedin: "https://linkedin.com/in/subinshk",
    github: "https://github.com/subin-shk",
  },
};

// Each beat opens a movement in place of a heading, picking up the sentence
// the previous movement left hanging.
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
    body: "Not a toolbox for its own sake — each one earns its place by covering a layer the others can't reach.",
  },
  projects: {
    beat: "Sharpened on <em>real systems</em>.",
    body: "Suites that run without me, against apps that change under them.",
  },
  /** Turns the corner from testing systems to having built them. */
  projectsAside: {
    beat: "Though it doesn't stop at <em>breaking things</em>.",
    body: "Some of these I designed and shipped end to end. Knowing how software gets built is most of knowing where it gives way — the instinct for what to test came from being on the other side of it first.",
  },
  journey: {
    beat: "Built one <em>deliberate step</em> at a time.",
    body: "Where the practice came from, and where it's going.",
  },
  achievements: {
    beat: "With a few moments worth <em>keeping</em>.",
    body: "Competition, community, and the occasional certificate.",
  },
  contact: {
    beat: "Let's build something <em>amazing</em>.",
    body: "Have a product that needs to hold up under pressure? I'd like to hear about it.",
  },
};

// `projects` and `frameworks` are counted from the lists below; `years` runs
// from the Chulo Solutions start (Feb 2025).
export const stats: Stat[] = [
  { id: "years", value: 1.5, suffix: "+", label: "Years of Experience" },
  { id: "projects", value: 9, suffix: "", label: "Projects Automated" },
  { id: "cases", value: 500, suffix: "+", label: "Test Cases Written" },
  { id: "frameworks", value: 6, suffix: "", label: "Automation Frameworks" },
];

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
    items: [
      { name: "JMeter", note: "Load" },
      { name: "Locust", note: "Scripted load" },
    ],
  },
  {
    id: "bdd",
    label: "BDD",
    accent: "cyan",
    items: [{ name: "Cucumber", note: "Gherkin specs" }],
  },
  {
    id: "rpa",
    label: "Automation",
    accent: "blue",
    items: [{ name: "Robot Process Automation", note: "Desktop flows" }],
  },
  {
    id: "programming",
    label: "Programming",
    accent: "violet",
    items: [
      { name: "Java", note: "" },
      { name: "Python", note: "" },
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
      "A hybrid UI and API suite for the Masteriyo LMS plugin, owned end to end at ThemeGrill — and since extended across the wider product catalogue, including Everest Forms.",
    challenge:
      "A WordPress LMS changes on two axes at once — the plugin ships new builds while themes and WordPress core move underneath it. UI-only checks broke constantly and told you nothing about why.",
    solution:
      "Built the suite in Robot Framework with Selenium for the interface and RequestsLibrary for the same flows at the API layer, so a failure separates a broken contract from a broken screen.",
    impact:
      "Regression passes that used to be manual now run unattended across several products, and coverage keeps up with the release cadence instead of trailing it.",
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
      "Mobile automation for a native shopping app, written as behaviour specifications rather than scripts.",
    challenge:
      "Mobile test code drifts away from the acceptance criteria it was written for. Six months on, nobody can tell which requirement a failing test actually defends.",
    solution:
      "Drove Appium through Cucumber, so every scenario is a readable Gherkin spec backed by step definitions. The feature files are the documentation; the automation is what keeps them honest.",
    impact:
      "Failures point at a business rule, not a line number — which means non-engineers can read the report and act on it.",
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
      "A Postman collection that exercises Trello's REST API across the full lifecycle of a board.",
    challenge:
      "API endpoints are easy to test one at a time and hard to test as a sequence. A board has to exist before a list can, and a list before a card.",
    solution:
      "Chained the requests with environment variables carrying IDs forward between steps, and wrote assertions on status, schema, and payload so each stage validates the last one's output.",
    impact:
      "One run creates, mutates, and tears down a board while checking every response along the way — repeatable, and safe to run against a live workspace.",
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
      "An e-commerce clothing store built from the ground up — catalogue, cart, checkout, and an admin side to keep it stocked.",
    challenge:
      "Shopping carts are where quality problems hide. State has to survive navigation, refreshes, and a login halfway through, and the price at checkout has to match the price on the shelf.",
    solution:
      "Built the storefront on PHP and MySQL with server-side session handling for the cart and parameterised queries throughout, then tested the checkout path the way a QA engineer would — from the edges inward.",
    impact:
      "Writing the thing I'd normally be testing changed how I test. It's the project that pushed me toward quality engineering.",
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
      "Real-time facial emotion recognition that reads a mood from a live camera feed and answers it with music to match.",
    challenge:
      "Emotion isn't a clean label. A classifier that looks accurate on paper still flickers between states frame to frame as lighting and expression shift — and a playlist that changes every second is useless.",
    solution:
      "Trained the recogniser on facial expression data and put a Flask service in front of it, smoothing predictions across a window of frames before committing to a mood and querying the library for it.",
    impact:
      "It taught me how differently you test something probabilistic. There's no single expected value to assert against — only a distribution to hold honest, which is a habit I've kept.",
    tech: ["Python", "Flask", "Machine Learning", "JavaScript", "SQLite"],
    github: "https://github.com/subin-shk/FaceTune",
    image: faceTune,
    imageFit: "plate",
    accent: "cyan",
  },
  {
    id: "6",
    index: "06",
    strand: "build",
    name: "Juggle Master",
    kicker: "VS Code Extension · Game",
    overview:
      "A VS Code extension that turns the editor into a juggling game — keep the ball in the air without leaving your workspace.",
    challenge:
      "Creating an interactive game inside VS Code while making it feel natural to use as an editor extension.",

    solution:
      "Developed a lightweight VS Code extension that lets users play a simple juggling game directly within the editor.",

    impact:
      "Published on the VS Code Marketplace, making the game available for developers to install and play.",
    tech: ["TypeScript", "VS Code API", "WebView", "Canvas API"],
    github: "https://github.com/subin-shk/juggle-master-vs-code",
    liveDemo: "https://marketplace.visualstudio.com/items?itemName=SubinShakya.juggle-master",
    image: juggleMaster,
    imageFit: "plate",
    accent: "blue",
  },
  {
    id: "7",
    index: "07",
    strand: "build",
    name: "Nudge",
    kicker: "Wellbeing · Desktop App",
    overview:
      "A lightweight desktop app that nudges you to drink water, stretch, and blink — the small habits that disappear when you're deep in focus.",
    challenge:
      "Wellness reminders are easy to dismiss and easier to turn off. The app had to be present enough to notice, unobtrusive enough to keep running.",
    solution:
      "Built a tray-resident app that fires gentle, timed reminders for hydration, movement, and eye rest — configurable intervals, no subscription, no noise.",
    impact:
      "Packaged as a downloadable release so it runs on install. A small thing that stays out of the way until it matters.",
    tech: ["Electron", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/subin-shk/nudge",
    image: nudge,
    imageFit: "plate",
    accent: "cyan",
  },
];

/** Everything else, shown as a quiet trailing strip. */
export const archiveProjects: ArchiveProject[] = [
  {
    id: "8",
    name: "MyDemoApp Automation",
    description:
      "The script-first counterpart to the BDD suite — Mocha and Appium over the same native app, with a page-object layer and clean session teardown between specs.",
    tech: ["Mocha JS", "Appium", "JavaScript"],
    github: "https://github.com/subin-shk/MyDemoApp-Automation",
  },
  {
    id: "9",
    name: "CodeNotes Automation",
    description:
      "End-to-end coverage of a note-taking app's auth and CRUD flows, with Pytest fixtures building the logged-in state once and injecting it everywhere.",
    tech: ["Python", "Pytest", "Selenium"],
    github: "https://github.com/subin-shk/CodeNotes-Automation",
  },
  {
    id: "10",
    name: "Student Management System",
    description:
      "A Java Swing desktop client covering full CRUD over student records against a SQL backend.",
    tech: ["Java", "Swing", "SQL"],
    github:
      "https://github.com/subin-shk/Student-Management-System-in-Java-Swing",
  },
  {
    id: "11",
    name: "Pharmacy Management System",
    description:
      "Inventory and customer records for a pharmacy counter, built as a Java Swing desktop application.",
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
      "First Runner-Up for a virtual try-on glasses application, built and demoed under competition time.",
    metric: "1st",
    metricLabel: "Runner-Up",
    icon: "trophy",
  },
  {
    id: "2",
    title: "GSSoC Extended '24",
    context: "GirlScript Summer of Code",
    description:
      "Contributed across the extended programme and finished ranked 216 out of 3,917 participants.",
    metric: "216",
    metricLabel: "of 3,917",
    icon: "award",
  },
  {
    id: "3",
    title: "Frogtoberfest",
    context: "Organised by LeapFrog",
    description:
      "Placed 8th overall for sustained open-source contribution through the event month.",
    metric: "8th",
    metricLabel: "Overall",
    icon: "medal",
  },
];
