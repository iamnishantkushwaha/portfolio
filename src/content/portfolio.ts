export const identity = {
  name: "Nishant Kushwaha",
  role: "Full Stack Developer",
  email: "nishantkushwaha145@gmail.com",
  location: "Jabalpur, Madhya Pradesh, India",
  github: "https://github.com/iamnishantkushwaha",
  linkedin: "https://www.linkedin.com/in/iamnishantkushwaha/",
  title: "Nishant Kushwaha | Full Stack MERN Developer for Hire, India",
  description:
    "Hire Nishant Kushwaha, a full stack developer in Jabalpur, India. React, Node.js, MongoDB, PostgreSQL, Shopify and IoT prototypes for websites, web apps and APIs.",
  socialTitle: "Nishant Kushwaha | Full Stack MERN Developer",
  socialDescription:
    "Full Stack Developer building web platforms with React.js, Node.js, Express.js, MongoDB and PostgreSQL.",
} as const;

export const navigation = [
  { href: "/#story", label: "Skills" },
  { href: "/#work", label: "Projects" },
  { href: "/#fit", label: "Hire me" },
  { href: "/#journey", label: "About" },
] as const;

export const sections = [
  { id: "top", label: "Intro" },
  { id: "story", label: "Skills" },
  { id: "work", label: "Projects" },
  { id: "fit", label: "Hire me" },
  { id: "journey", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export const marquee = ["React.js", "Node.js", "Express.js", "MongoDB", "PostgreSQL", "Shopify", "REST APIs"] as const;

export const chapters = [
  { title: ["It starts in the", { em: "browser." }], body: "React.js and JavaScript turn a need into an interface people can actually use.", chips: ["React.js", "JavaScript"] },
  { title: ["Then the", { em: "server" }, "takes over."], body: "Node.js and Express.js handle requests, and REST APIs keep the contract clean.", chips: ["Node.js", "Express.js", "REST APIs"] },
  { title: ["Data lives where it", { em: "fits." }], body: "MongoDB for flexible documents, PostgreSQL when relationships matter.", chips: ["MongoDB", "PostgreSQL"] },
  {
    title: ["Other services", { em: "plug in." }],
    body: "Third-party APIs and Shopify storefronts are core. AI and messaging tools are integrations from AI-assisted projects. Solid is core, dashed is exposure.",
    chips: ["Third-party APIs", "Shopify"],
    exposure: ["Gemini", "Groq", "OpenAI", "WhatsApp", "FastAPI", "React Native"],
  },
  { title: ["And it", { em: "ships." }], body: "A working version in front of real users. APIFlowy is live right now.", cta: { label: "Open the live demo", href: "https://apiflowy.onrender.com/" } },
] as const;

export const pipeline = ["Interface", "Server", "Data", "Integrations", "Live"] as const;

export type ProjectId = "apiflowy" | "invoice" | "attendance" | "vistaar";

export const projects: readonly {
  id: ProjectId;
  status: string;
  name: string;
  description: string;
  technologies: readonly string[];
  link?: { label: string; href: string; secondary?: boolean };
}[] = [
  {
    id: "apiflowy",
    status: "Completed. Live demo",
    name: "APIFlowy",
    description: "An AI-powered backend automation platform for API generation, testing, analytics and documentation, with Gemini and Groq integrations.",
    technologies: ["API generation", "Testing", "Analytics", "Docs", "Gemini", "Groq"],
    link: { label: "Open the live demo", href: "https://apiflowy.onrender.com/" },
  },
  {
    id: "invoice",
    status: "In progress",
    name: "Invoice App",
    description: "Voice-assisted invoicing for small businesses. Create invoices by voice and manage multiple shops from one app.",
    technologies: ["Voice input", "Invoicing", "Multi-shop"],
  },
  {
    id: "attendance",
    status: "Prototype",
    name: "ESP32-CAM Attendance",
    description: "An IoT attendance prototype built around an ESP32-CAM, from the IoT side of my degree.",
    technologies: ["ESP32-CAM", "IoT"],
    link: { label: "Repository: attendencesystem", href: "https://github.com/iamnishantkushwaha/attendencesystem", secondary: true },
  },
  {
    id: "vistaar",
    status: "Professional project",
    name: "Vistaar eSIM",
    description: "A Shopify storefront for eSIM products. Shown at a high level because implementation details are confidential.",
    technologies: ["Shopify", "E-commerce"],
  },
];

export const recruiterRows = [
  { label: "Role", value: "Full stack (MERN) developer, open to full-time roles" },
  { label: "Now", value: "MERN Stack Developer Intern at ADRS Techno Pvt. Ltd., since December 2025" },
  { label: "Education", value: "B.Tech in IoT & Cybersecurity, Shri Ram Institute of Science & Technology, 2023 to 2027" },
  { label: "Stack", value: "React.js, JavaScript, Node.js, Express.js, MongoDB, PostgreSQL, Shopify, REST APIs" },
] as const;

export const needs = [
  { title: "A REST API or backend", body: "I'd design and build a Node.js and Express API with MongoDB or PostgreSQL behind it.", related: "Related: APIFlowy, a live API automation platform." },
  { title: "A React web app", body: "I'd build the React interface and the API it talks to, end to end.", related: "Related: Invoice App, currently in progress." },
  { title: "A Shopify store", body: "I'd build or customise a Shopify storefront around your products.", related: "Related: the Vistaar eSIM storefront." },
  { title: "AI or WhatsApp integration", body: "I'd connect Gemini, Groq, OpenAI or WhatsApp APIs into your product flow.", related: "Related: APIFlowy uses Gemini and Groq." },
  { title: "An IoT prototype", body: "I'd prototype a hardware and software idea with an ESP32-CAM.", related: "Related: the ESP32-CAM Attendance prototype." },
] as const;

export const timeline = [
  { when: "December 2025 to present", title: "MERN Stack Developer Intern", detail: "ADRS Techno Pvt. Ltd." },
  { when: "2023 to 2027", title: "B.Tech, IoT & Cybersecurity", detail: "Shri Ram Institute of Science & Technology" },
  { when: "Next", title: "More useful things, shipped." },
] as const;

export const services = [
  { name: "Websites and web apps", detail: "React.js front ends with a Node.js and Express back end, built end to end." },
  { name: "REST APIs and backends", detail: "Node.js and Express APIs with MongoDB or PostgreSQL, documented and tested." },
  { name: "Shopify stores", detail: "Shopify storefronts built or customised around your products." },
  { name: "AI and WhatsApp integrations", detail: "Gemini, Groq, OpenAI or WhatsApp APIs connected into your product flow." },
  { name: "IoT prototypes", detail: "Hardware and software prototypes with ESP32-CAM, backed by a web dashboard." },
] as const;

export const faqs = [
  { q: "Who is Nishant Kushwaha?", a: "Nishant Kushwaha is a full stack (MERN) developer based in Jabalpur, Madhya Pradesh, India. He is a B.Tech student in IoT and Cybersecurity at Shri Ram Institute of Science & Technology and a MERN Stack Developer Intern at ADRS Techno Pvt. Ltd." },
  { q: "Can Nishant build my website, web app or API?", a: "Yes. He builds React.js interfaces, Node.js and Express APIs and MongoDB or PostgreSQL databases, and ships them as working products. APIFlowy, an API automation platform, is live as a demo." },
  { q: "Does Nishant build Shopify stores?", a: "Yes. He builds and customises Shopify storefronts, including a Shopify store for eSIM products shown at a high level because details are confidential." },
  { q: "Can Nishant build IoT devices or prototypes?", a: "He builds IoT prototypes that pair hardware with software. His ESP32-CAM attendance system is a prototype that connects a camera device to a web back end." },
  { q: "Can Nishant add AI or WhatsApp features to my product?", a: "He integrates third-party AI and messaging APIs such as Gemini, Groq, OpenAI and WhatsApp into products. These are integrations inside the applications he builds." },
  { q: "Is Nishant available for hire?", a: "He is open to full-time developer roles and welcomes project enquiries from clients. The fastest way to reach him is by email, GitHub or LinkedIn, and he works remotely with teams and clients." },
] as const;