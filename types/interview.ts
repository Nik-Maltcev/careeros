export type InterviewLevel = "junior" | "middle" | "senior"

export interface InterviewQuestion {
  id: string
  text: string
  level: InterviewLevel
  specialty: string
  expectedAnswer?: string
  keywords?: string[]
}

export interface InterviewResponse {
  questionId: string
  audioBlob: Blob
  transcript?: string
  duration: number
  timestamp: Date
}

export interface InterviewSession {
  id: string
  specialty: string
  level: InterviewLevel
  questions: InterviewQuestion[]
  responses: InterviewResponse[]
  startTime: Date
  endTime?: Date
  status: "in-progress" | "completed" | "cancelled"
}

export interface InterviewAnalysis {
  overallScore: number
  technicalScore: number
  communicationScore: number
  confidenceScore: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  detailedFeedback: {
    questionId: string
    score: number
    feedback: string
    keywords: string[]
  }[]
}

export interface InterviewResult {
  session: InterviewSession
  analysis: InterviewAnalysis
  createdAt: Date
}

export interface Specialty {
  id: string
  name: string
  description: string
  icon: string
  color: string
  skills: string[]
}

export const SPECIALTIES: Specialty[] = [
  {
    id: "frontend",
    name: "Frontend Developer",
    description: "HTML, CSS, JavaScript, React, Vue.js",
    icon: "💻",
    color: "blue",
    skills: ["HTML", "CSS", "JavaScript", "React", "Vue.js", "TypeScript"],
  },
  {
    id: "backend",
    name: "Backend Developer",
    description: "Node.js, Python, Java, Databases",
    icon: "⚙️",
    color: "green",
    skills: ["Node.js", "Python", "Java", "SQL", "APIs", "Microservices"],
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    description: "Docker, Kubernetes, CI/CD, AWS",
    icon: "🚀",
    color: "purple",
    skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Monitoring"],
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    description: "Python, Machine Learning, Statistics",
    icon: "📊",
    color: "orange",
    skills: ["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "TensorFlow"],
  },
  {
    id: "product-manager",
    name: "Product Manager",
    description: "Strategy, Analytics, User Research",
    icon: "📋",
    color: "indigo",
    skills: ["Strategy", "Analytics", "User Research", "Roadmapping", "Agile", "Stakeholder Management"],
  },
  {
    id: "ux-ui-designer",
    name: "UX/UI Designer",
    description: "Design Systems, Prototyping, User Research",
    icon: "🎨",
    color: "pink",
    skills: [
      "Figma",
      "Prototyping",
      "User Research",
      "Design Systems",
      "Usability Testing",
      "Information Architecture",
    ],
  },
  {
    id: "marketing",
    name: "Marketing Specialist",
    description: "Digital Marketing, SEO, Analytics",
    icon: "📈",
    color: "red",
    skills: ["Digital Marketing", "SEO", "Analytics", "Content Marketing", "Social Media", "PPC"],
  },
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Agile, Scrum, Team Leadership",
    icon: "👥",
    color: "teal",
    skills: ["Agile", "Scrum", "Team Leadership", "Risk Management", "Budget Planning", "Communication"],
  },
  {
    id: "business-analyst",
    name: "Business Analyst",
    description: "Requirements Analysis, Process Modeling",
    icon: "📊",
    color: "cyan",
    skills: [
      "Requirements Analysis",
      "Process Modeling",
      "Data Analysis",
      "Stakeholder Management",
      "Documentation",
      "SQL",
    ],
  },
  {
    id: "system-analyst",
    name: "System Analyst",
    description: "System Design, Architecture, Integration",
    icon: "🔧",
    color: "gray",
    skills: [
      "System Design",
      "Architecture",
      "Integration",
      "Technical Documentation",
      "Database Design",
      "API Design",
    ],
  },
  {
    id: "tech-support",
    name: "Technical Support Specialist",
    description: "Troubleshooting, Customer Service, IT Support",
    icon: "🛠️",
    color: "yellow",
    skills: [
      "Troubleshooting",
      "Customer Service",
      "IT Support",
      "Network Administration",
      "Hardware",
      "Software Installation",
    ],
  },
]

export const LEVEL_DESCRIPTIONS = {
  junior: {
    name: "Junior",
    description: "1-2 года опыта",
    questions: 8,
    duration: "10-15 мин",
    focus: "Основы и базовые концепции",
  },
  middle: {
    name: "Middle",
    description: "2-5 лет опыта",
    questions: 10,
    duration: "15-20 мин",
    focus: "Практический опыт и решение задач",
  },
  senior: {
    name: "Senior",
    description: "5+ лет опыта",
    questions: 12,
    duration: "20-25 мин",
    focus: "Архитектура, лидерство и экспертиза",
  },
}
