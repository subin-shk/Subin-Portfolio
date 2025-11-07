import { Experience, Achievement, Education, Skill, NavItem } from "../types";

export const navigationItems: NavItem[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Achievements", href: "#achievements" },
  { name: "Education", href: "#education" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export const experiences: Experience[] = [
  {
    id: "1",
    role: "Junior QA Engineer",
    company: "ThemeGrill Pvt. Ltd.",
    duration: "May 2025 - Present",
    description: [
      "Build automation framework reducing manual testing efforts.",
      "Test and automate wordpress plugins and themes.",
      "Refactor automation scripts to improve performance and maintainability, reducing manual effort.",
      "Work closely with developers to maintain quality, report bugs, and meet tight deadlines."
    ],
    skills: "Selenium, Robot Framework, Manual Testing, Google Lighthouse"
  },
  {
    id: "2",
    role: "Software Quality Assurance Intern",
    company: "Chulo Solutions Pvt. Ltd.",
    duration: "Feb 2025 - May 2025",
    description: [
      "Designed and executed comprehensive test plans for web and mobile applications.",
      "Performed API testing and managed test scripts and validations using Postman.",
      "Developed and maintained automated test scripts using Python and JavaScript.",
      "Identified and tracked software defects using JIRA.",
    ],
    skills:"Selenium, Appium, MochaJS, Pytest, Postman, Jira",
  },
];

export const achievements: Achievement[] = [
  {
    id: "1",
    title: "Hackathon Champion",
    description:
      "Won First Runner-Up in NCCS Hackathon Plus+ 2024 for developing a virtual try-on glasses application.",
    icon: "trophy",
  },
  {
    id: "2",
    title: "Open Source Contribution",
    description:
      "Contributed to GirlScript Summer of Code Extended 2024 and Frogtoberfest organized by LeapFrog. Achieved a rank of 216 out of 3,917 participants in GSSoC Extended ’24 and 8th place in Frogtoberfest.",
    icon: "award",
  },
];

export const educationHistory: Education[] = [
  {
    id: "1",
    degree:
      "Bachelors of Science in Computer Science and Information Technology",
    institution: "National College of Computer Studies - Paknajol, Kathmandu",
    duration: "2021 - 2025",
    grade: "Percentage: 82%",
    honors: "Distinction",
  },
  {
    id: "2",
    degree: " High School | +2 Science",
    institution: "Trinity International SS & College - Dillibazar, Kathmandu",
    duration: "2018 - 2021",
    grade: "3.61 CGPA",
    honors: "Grade: A+",
  },
  {
    id: "3",
    degree: "Secondary Education Examination (SEE)",
    institution:
      "N.K. Singh Memorial English Preparatory Secondary School -  New Baneshowr, Kathmandu",
    duration: "2018",
    grade: "3.75 GPA",
    honors: "Grade: A+",
  },
];

export const skills: Skill[] = [
  // Technical Skills
  { id: "1", name: "Automated Testing", level: 85, category: "technical" },
  { id: "2", name: "Manual Testing", level: 90, category: "technical" },
  { id: "3", name: "Mobile Testing", level: 85, category: "technical" },

  // Tools
  { id: "4", name: "Selenium", level: 90, category: "tools" },
  { id: "5", name: "Appium", level: 90, category: "tools" },
  { id: "6", name: "Postman", level: 90, category: "tools" },
  { id: "7", name: "JIRA", level: 95, category: "tools" },

  // Soft Skills
  { id: "8", name: "Communication", level: 95, category: "soft" },
  { id: "9", name: "Problem Solving", level: 85, category: "soft" },
  { id: "10", name: "Attention to Detail", level: 90, category: "soft" },
  { id: "11", name: "Project Management", level: 85, category: "soft" },
  { id: "12", name: "Adaptability", level: 90, category: "soft" },
];

export const personalInfo = {
  name: "Subin Shakya",
  title: "Software Quality Assurance Engineer",
  email: "subin12.shakya@gmail.com",
  // phone: '+1 (555) 123-4567',
  location: "Kathmandu, Nepal",
  summary: `I’m a dedicated Software Quality Assurance Engineer with hands-on experience in automated testing and building effective QA processes. I work with tools like Selenium, Appium, and Postman to ensure software reliability and user satisfaction. I'm passionate about maintaining high standards of quality and continuously improving development workflows.`,
  socialLinks: {
    linkedin: "https://linkedin.com/in/subinshk",
    github: "https://github.com/subin-shk",
    // twitter: "https://twitter.com/subinshakya",
  },
};
