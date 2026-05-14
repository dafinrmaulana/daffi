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

export type Post = {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  thumbnail: string;
  excerpt: string;
  body: string[];
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
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
export const posts: Post[] = [
  {
    slug: "designing-dense-interfaces",
    title: "Designing dense interfaces without visual noise",
    date: "2026-04-18",
    readTime: "4 min",
    tags: ["Design", "Frontend"],
    thumbnail: "/images/blog-dense-interfaces.svg",
    excerpt: "Notes on hierarchy, rhythm, and restraint for tools that users keep open all day.",
    body: [
      "Dense interfaces work when every visible element earns its place. The goal is not to remove information, but to make scanning cheaper.",
      "Start with the user rhythm: what they check first, what changes often, and what decisions the page should accelerate.",
    ],
  },
  {
    slug: "portfolio-as-product",
    title: "Treating a portfolio like a product surface",
    date: "2026-03-02",
    readTime: "3 min",
    tags: ["Portfolio", "Writing"],
    thumbnail: "/images/blog-portfolio-product.svg",
    excerpt: "A portfolio can do more than display work; it can demonstrate judgment in the way it is structured.",
    body: [
      "A strong portfolio does not need to explain every capability at once. It should give readers enough signal to understand taste, range, and process.",
      "Case studies are most useful when they show constraints, decisions, and measurable change.",
    ],
  },
];

export const experiences: Experience[] = [
  {
    company: "PT. Herca Cipta Dermal Perdana",
    role: "Frontend Developer",
    period: "MAR 2025 - Present",
    location: "Jakarta / On Site",
    description:
      "I was responsible for developing, maintaining, and improving the company's internal applications and websites. This included building new features, optimizing performance, and ensuring the systems ran smoothly and efficiently. I worked closely with different teams to understand requirements, troubleshoot issues, and deliver secure and user-friendly solutions. I also looked for ways to improve the overall functionality and adopted best practices to keep the codebase clean and scalable.",
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
    company: "Freelance Web Developer",
    role: "Fullstack Developer",
    period: "JAN 2025 - MAR 2025",
    location: "Remote",
    description:
      "Developed and maintained custom web applications, company profiles, and internal business systems using modern and legacy web technologies.",
    highlights: [
      "Next.js",
      "Nuxt.js",
      "Laravel",
      "PHP",
      "Vue.js",
      "jQuery",
      "Tailwind CSS",
      "Bootstrap",
      "Responsive frontend development",
    ],
  },
  {
    company: "PT. Kodingkeun Digital Solution",
    role: "Frontend Developer",
    period: "JUL 2022 - JAN 2025",
    location: "Indonesia",
    description:
      "In this role, I focused on delivering visually appealing and highly functional designs that met client requirements while ensuring optimal user experience and responsiveness across all devices. This experience enhanced my skills in web design, front-end development, and user-centric design principles, enabling me to contribute effectively to a variety of digital projects.",
    highlights: ["Vue.JS", "React.JS", "Next.JS", "Nuxt.JS", "Laravel"],
  },
  {
    company: "PT. CIGS Indonesia Digital",
    role: "Junior Programmer - PKL",
    period: "JUL 2021 - OCT 2021",
    location: "Indonesia",
    description:
      "I contributed as a full-stack developer in the development of an e-voting application using Laravel. My primary responsibility was to design and implement a user-friendly interface that is fully responsive across all devices. Additionally, I collaborated with the team to perform thorough debugging and testing to ensure the application operated smoothly and securely. This experience strengthened my skills in full-stack development, responsive design, and teamwork to deliver a functional and reliable product.",
    highlights: ["Laravel", "MySQL", "HTML", "CSS", "JQuery", "Bootstrap", "Javascript"],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.demo_url === slug);
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
