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
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
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

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: 'technical' | 'soft' | 'tools';
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}