import { Experience, Achievement, Education, Skill, NavItem } from "../types";
import cloverEmporium from "../images/projects/clover_emporium.png";

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
    grade: "Percentage: 80.71%",
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
  { id: "1", name: "Selenium", icon: "FaChrome" },
  { id: "2", name: "Appium", icon: "FaMobileAlt" },
  { id: "3", name: "Postman", icon: "FaRocket" },
  { id: "4", name: "Robot Process Automation", icon: "FaRobot" },
  { id: "5", name: "Cucumber BDD", icon: "FaLeaf" },
  { id: "6", name: "JMeter", icon: "FaBolt" },
  { id: "7", name: "Locust", icon: "FaBug" },
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

export const projects = {
  automation: [
    {
      id: '1',
      name: 'CodeNotes Automation',
      description: 'This project uses Pytest and Selenium to automate and test the flow of a web application.',
      github: 'https://github.com/subin-shk/CodeNotes-Automation',
      tags: ['Python', 'Pytest', 'Selenium', 'Automation'],
    },
    {
      id: '2',
      name: 'MyDemoApp Automation',
      description: 'Mobile application automation using Appium',
      github: 'https://github.com/subin-shk/MyDemoApp-Automation',
      tags: ['Mocha JS', 'Appium', 'Mobile Testing'],
    },
    {
      id: '3',
      name: 'MyDemoApp BDD Automation',
      description: 'Mobile application automation using Appium with BDD approach',
      github: 'https://github.com/subin-shk/MyDemoApp-BDD/tree/main/features',
      tags: ['Cucumber', 'Appium', 'BDD', 'Mobile Testing'],
    },
    {
      id: '4',
      name: 'Trello Postman Collection',
      description: 'Trello Postman Collection for API testing of Trello functionalities.',
      github: 'https://github.com/subin-shk/Trello_Postman_Collection',
      tags: ['Postman', 'API Testing'],
    },
    {
      id: '5',
      name: 'Masteriyo Automation',
      description: 'Automation of the Masteriyo LMS plugin using Robot Framework and Selenium, and integrate API testing within the Robot Framework test suite.',
      tags: ['Robot Framework', 'Selenium', 'API Testing'],
    },
  ],
  web: [
    {
      id: '6',
      name: 'Clover Emporium',
      description: 'An e-commerce clothing store website dedicated to providing a seamless and intuitive online shopping experience, offering a diverse range of clothing products to its users.',
      github: 'https://github.com/subin-shk/CloverEmporium',
      image: cloverEmporium,
      tags: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'PHP', 'SQL'],
    },
    {
      id: '7',
      name: 'Face Tune',
      description: 'The purpose of this project is to use real-time facial recognition to acquaint the machine with abilities to recognize and examine human emotions. With this, the machine will be trained to provide the user with suitable songs for that particular mood.',
      github: 'https://github.com/subin-shk/FaceTune',
      tags: ['HTML', 'CSS', 'JavaScript', 'Flask', 'Machine Learning', 'SQLite'],
    },
  ],
  others: [
    {
      id: '8',
      name: 'Student Management System',
      description: 'Student Management System in Java Swing that fulfills basic CRUD operations related to addition, deletion, etc. of students.',
      github: 'https://github.com/subin-shk/Student-Management-System-in-Java-Swing',
      tags: ['Java', 'Swing', 'SQL', 'CRUD Operations'],
    },
    {
      id: '9',
      name: 'Pharmacy Management System',
      description: 'Pharmacy Management System in Java Swing that fulfills basic CRUD operations related to addition, deletion, etc. of medicines and customers.',
      github: 'https://github.com/subin-shk/Pharmacy-Management-System',
      tags: ['Java', 'Swing', 'SQL', 'CRUD Operations'],
    },
  ],
};