export type Project = {
  demo_url: string;
  title: string;
  company: string;
  year: string;
  role: string;
  tags: string[];
  thumbnail: string;
  metric: string;
  metrics: Array<{ label: string; value: string }>;
  excerpt: string;
  featured: boolean;
  wip?: boolean;
  body: string[];
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string | string[];
  highlights: string[];
};

export const skills = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Vue.js",
  "React Native",
  "Bootstrap",
  "jQuery",
  "HTML",
  "CSS",
  "JavaScript",
  "Svelte",
  "Nuxt.js",
  "SvelteKit",
  "Laravel",
  "PHP",
  "Android",
  "iOS",
  "CI/CD",
  "Node.js",
  "ADB",
];

export const projects: Project[] = [
  {
    demo_url: "https://herca.id",
    title: "Redesigning Herca Corporate Website",
    company: "PT. Herca Cipta Dermal Perdana",
    year: "2026",
    role: "Frontend Developer",
    tags: ["Next.js", "Tailwind CSS", "SEO", "SSR"],
    thumbnail: "/images/portfolio/herca-id.png",
    metric: "Modern corporate experience",
    metrics: [
      { label: "SEO optimized", value: "100%" },
      { label: "Responsive pages", value: "Fully" },
    ],
    excerpt:
      "A modern corporate website focused on brand credibility, SEO performance, and responsive user experience across devices.",
    featured: true,
    body: [
      "Built a modern company profile platform for Herca with a strong focus on performance, accessibility, and clean visual presentation.",
      "Implemented responsive layouts, SEO optimization, and scalable frontend architecture to improve brand visibility and user engagement.",
    ],
  },

  {
    demo_url: "https://play.google.com/store/apps/details?id=com.herca.erp&hl=en",
    title: "Developing Internal ERP Mobile Application",
    company: "PT. Herca Cipta Dermal Perdana",
    year: "2025",
    role: "Frontend Developer",
    tags: ["React Native", "Android", "iOS", "Node.js", "TypeScript"],
    thumbnail: "/images/portfolio/herca-erp.png",
    metric: "Cross-platform productivity",
    metrics: [
      { label: "Platforms", value: "Android & iOS" },
      { label: "Architecture", value: "Scalable" },
    ],
    excerpt:
      "A cross-platform ERP mobile application designed to streamline internal operational workflows for employees and management teams.",
    featured: true,
    body: [
      "Developed and maintained an internal ERP mobile application used for operational activities, reporting, and employee productivity.",
      "Focused on performance optimization, reusable component architecture, and seamless integration with internal APIs and business workflows.",
    ],
  },

  {
    demo_url: "https://play.google.com/store/apps/details?id=com.herca.hris&hl=en",
    title: "Modernizing Internal HRIS Mobile Application",
    company: "PT. Herca Cipta Dermal Perdana",
    year: "2025",
    role: "Frontend Developer",
    tags: ["React Native", "Android", "iOS", "TypeScript"],
    thumbnail: "/images/portfolio/herca-hris.png",
    metric: "Improved employee experience",
    metrics: [
      { label: "Core features", value: "HR Automation" },
      { label: "User experience", value: "Enhanced" },
    ],
    excerpt:
      "A mobile-first HRIS platform that simplifies attendance, leave management, and employee self-service processes.",
    featured: true,
    body: [
      "Improved and redesigned the company’s internal HRIS application to provide a more intuitive and efficient employee experience.",
      "Enhanced application usability, optimized feature flows, and implemented scalable frontend patterns for long-term maintainability.",
    ],
  },

  {
    demo_url: "https://www.npmjs.com/package/@herca/r-kit",
    title: "Contributing to Internal React UI Kit",
    company: "PT. Herca Cipta Dermal Perdana",
    year: "2025",
    role: "Frontend Developer",
    tags: ["React", "TypeScript", "Component Library", "Design System"],
    thumbnail: "/images/portfolio/npm.webp",
    metric: "Reusable frontend ecosystem",
    metrics: [
      { label: "Shared components", value: "Reusable" },
      { label: "Development speed", value: "Faster" },
    ],
    excerpt:
      "A reusable React component system built to standardize frontend development across multiple internal products.",
    featured: true,
    body: [
      "Contributed to the development of reusable UI components and shared frontend standards for internal web applications.",
      "Helped improve development consistency, maintainability, and implementation speed across different project teams.",
    ],
  },

  {
    demo_url: "https://www.npmjs.com/package/@herca/rn-kit",
    title: "Building Internal React Native Component Library",
    company: "PT. Herca Cipta Dermal Perdana",
    year: "2025",
    role: "Frontend Developer",
    tags: ["React Native", "TypeScript", "Mobile UI", "Design System"],
    thumbnail: "/images/portfolio/npm.webp",
    metric: "Reusable mobile components",
    metrics: [
      { label: "Cross-platform", value: "Unified" },
      { label: "Code reuse", value: "Optimized" },
    ],
    excerpt: "A scalable mobile UI component library designed to accelerate React Native application development.",
    featured: true,
    body: [
      "Developed reusable mobile components, utilities, and design patterns for internal React Native projects.",
      "Focused on consistency, code reusability, and improving developer experience across mobile application teams.",
    ],
  },

  {
    demo_url: "https://shineorganizer.f-g.my.id/template",
    title: "Developing Interactive Wedding Invitation Template",
    company: "PT. Kodingkeun Digital Solution",
    year: "2025",
    role: "Frontend Developer",
    tags: ["HTML", "CSS", "Bootstrap", "JavaScript"],
    thumbnail: "/images/portfolio/shineorganizer.png",
    metric: "Elegant digital invitation",
    metrics: [
      { label: "Responsive design", value: "Mobile-ready" },
      { label: "Animations", value: "Interactive" },
    ],
    excerpt:
      "A responsive digital wedding invitation template with elegant visual presentation and interactive user experience.",
    featured: true,
    body: [
      "Built a customizable wedding invitation landing page with responsive layouts and smooth interactive animations.",
      "Focused on delivering visually appealing experiences while maintaining lightweight performance and accessibility.",
    ],
  },

  {
    demo_url: "https://kodingkeun.com/",
    title: "Rebuilding Kodingkeun Corporate Website",
    company: "PT. Kodingkeun Digital Solution",
    year: "2024",
    role: "Frontend Developer",
    tags: ["Nuxt.js", "Tailwind CSS", "SEO", "SSR"],
    thumbnail: "/images/portfolio/kodingkeun.png",
    metric: "High-performance company profile",
    metrics: [
      { label: "Performance", value: "Optimized" },
      { label: "SEO", value: "Improved" },
    ],
    excerpt:
      "A high-performance company profile website with modern UI, SEO optimization, and scalable content structure.",
    featured: true,
    wip: true,
    body: [
      "Rebuilt the company profile website using a modern frontend stack with strong emphasis on performance and branding.",
      "Implemented reusable sections, responsive design systems, and SEO-friendly architecture for better online presence.",
    ],
  },

  {
    demo_url: "https://akunmu.id/",
    title: "Revamping Akunmu Corporate Website",
    company: "PT. Akunmu Digital Solution",
    year: "2024",
    role: "Freelance Frontend Developer",
    tags: ["Laravel", "PHP", "Blade", "Bootstrap", "JavaScript", "jQuery", "SEO"],
    thumbnail: "/images/portfolio/akunmu.png",
    metric: "Professional business presence",
    metrics: [
      { label: "Responsive layout", value: "Fully" },
      { label: "Frontend structure", value: "Maintainable" },
    ],
    excerpt: "A professional business website designed to strengthen digital branding and improve customer engagement.",
    featured: true,
    wip: true,
    body: [
      "Developed a responsive company profile website tailored to improve brand identity and digital visibility.",
      "Optimized page performance, structured layouts, and frontend maintainability for long-term scalability.",
    ],
  },

  {
    demo_url: "https://otakunote.daffi.my.id/",
    title: "Building Otakunote Series Tracking Platform",
    company: "Personal",
    year: "2024",
    role: "Fullstack Web Developer",
    tags: ["Laravel", "Inertia.js", "Vue", "Tailwind CSS", "PHP"],
    thumbnail: "/images/portfolio/otakunote.png",
    metric: "Entertainment tracking platform",
    metrics: [
      { label: "Tracking system", value: "Multi-series" },
      { label: "User experience", value: "Personalized" },
    ],
    excerpt: "A personal tracking platform for managing anime, manga, movies, novels, and entertainment watchlists.",
    featured: true,
    wip: true,
    body: [
      "Built a fullstack web application that allows users to track entertainment activities such as anime, manga, movies, and novels.",
      "Implemented authentication, progress tracking, status management, ratings, and personalized user experiences.",
    ],
  },

  {
    demo_url: "https://portfolio-iqbal.daffi.my.id/",
    title: "Designing Interactive Personal Portfolio Website",
    company: "Personal",
    year: "2024",
    role: "Frontend Developer",
    tags: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
    thumbnail: "/images/portfolio/portfolio-iqbal.png",
    metric: "Modern personal branding",
    metrics: [
      { label: "UI experience", value: "Interactive" },
      { label: "Performance", value: "Optimized" },
    ],
    excerpt:
      "A modern portfolio website showcasing projects, technical expertise, and frontend development experience.",
    featured: true,
    wip: true,
    body: [
      "Created a responsive portfolio website focused on clean presentation, smooth navigation, and modern frontend practices.",
      "Designed to highlight projects, technical skills, and personal branding with lightweight and optimized performance.",
    ],
  },
];
export const experiences: Experience[] = [
  {
    company: "PT. Herca Cipta Dermal Perdana",
    role: "Front-End Developer",
    period: "MAR 2025 - Present",
    location: "West Jakarta, Indonesia",
    description: [
      "Built the internal ERP Mobile app from scratch using React Native.",
      "Created a modern Next.js boilerplate for incremental legacy ERP web migration.",
      "Built dynamic, API-driven features (filters, forms, sidebars) across web and mobile.",
      "Created cross-platform authentication to prevent users from re-logging between legacy and Next.js applications.",
      "Modernized the internal HRIS by upgrading it to Next.js 15 and Tailwind CSS.",
      "Resolved complex TypeScript type issues and linting errors across legacy projects.",
      "Isolated legacy HRIS code with Redux and dedicated ESLint configurations to prevent breaking changes.",
      "Maintained and expanded internal React and React Native UI libraries published on NPM (@herca/r-kit and @herca/rn-kit).",
      "Collaborated with UI/UX designers, backend engineers, and QA to deliver production-ready features.",
      "Improved performance and type safety through dependency patches, debugging, and code reviews.",
    ],
    highlights: [
      "Legacy modernization",
      "UI implementation",
      "React Native",
      "Next.JS",
      "Javascript",
      "HTML",
      "CSS",
      "Laravel",
      "Laravel Blade",
      "Tailwind CSS",
    ],
  },
  {
    company: "PT. Kodingkeun Digital Solution",
    role: "Front-End Developer",
    period: "JUL 2022 - MAR 2025",
    location: "Pangandaran, Indonesia",
    description: [
      "Built a public survey and feedback application targeting users within the Tasikmalaya region.",
      "Rebuilt an e-voting system for a local vocational high school (SMK) election using modern web technologies.",
      "Created responsive Bootstrap templates for a browser-based wedding invitation builder.",
      "Designed and developed the landing page for umkm.page, a WordPress-based website builder.",
      "Revamped the akunmu.id landing page using Laravel Blade and Tailwind CSS.",
      "Maintained the akunmu.id dashboard by implementing new features and resolving bugs.",
      "Designed UI/UX mockups and developed responsive frontend interfaces based on client requirements.",
      "Integrated RESTful APIs to build dynamic, data-driven user interfaces.",
      "Collaborated with Designers, Backend Engineers, and QA to continuously improve product features.",
    ],
    highlights: ["Vue.JS", "React.JS", "Next.JS", "Nuxt.JS", "Laravel"],
  },
  {
    company: "PT. CIGS Indonesia Digital",
    role: "Full-Stack Developer - Intern",
    period: "JUL 2021 - OCT 2021",
    location: "Cimahi, Indonesia",
    description: [
      "Developed a full-stack e-voting application from scratch using Laravel.",
      "Tested and debugged the application to ensure security and stability before election day.",
      "Managed version control using Git and GitHub to maintain a clean and organized codebase.",
      "Successfully deployed the application, onboarding hundreds of active student and teacher voters.",
    ],
    highlights: ["Laravel", "MySQL", "HTML", "CSS", "JQuery", "Bootstrap", "Javascript"],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.demo_url === slug);
}
