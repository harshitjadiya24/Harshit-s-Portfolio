export const profile = {
  name: "Harshit Jadiya",
  role: "AI Engineer · Generative & Agentic AI",
  school: "B.Tech ECE · IIIT Nagpur",
  location: "Nagpur, India",
  email: "harshitjadiya91@gmail.com",
  linkedin: "https://www.linkedin.com/in/harshit-jadiya24/",
  github: "https://github.com/harshitjadiya24",
  tagline:
    "I build intelligent systems that look expensive, feel human, and ship.",
}

/** Scrub-filled statement. Wrap a word in *asterisks* to make it fill to signal. */
export const philosophy =
  "Accuracy without *taste* is a spreadsheet. I build models that move pixels, products, and people — and I obsess over the 200ms that make an interface feel *alive.*"

/**
 * Work rows. Add `poster: "/work/<slug>.jpg"` and/or `video: "/work/<slug>.mp4"`
 * (files in public/work/) to replace the generated poster and contour preview.
 */
export const projects: {
  index: string
  slug: string
  title: string
  year: string
  tags: string[]
  description: string
  accent: string
  /** Source on GitHub. */
  repo?: string
  /** Deployed demo. */
  live?: string
  poster?: string
  video?: string
}[] = [
  {
    index: "01",
    slug: "omnidoc-rag",
    title: "OmniDoc RAG",
    year: "2026",
    tags: ["RAG", "Hybrid retrieval", "Ollama", "FastAPI", "TypeScript"],
    description:
      "Ask your PDFs questions and check every answer. Hybrid BM25 + vector retrieval with a cross-encoder rerank, streaming answers that cite document and page, and every citation re-read and scored. No evidence, no answer: it refuses instead of guessing.",
    accent: "#ffb547",
    repo: "https://github.com/harshitjadiya24/OmniDoc-RAG",
    live: "https://omnidoc-rag.vercel.app/",
  },
  {
    index: "02",
    slug: "vanrakshak-ai",
    title: "VanRakshak AI",
    year: "2026",
    tags: ["Computer Vision", "FastAPI", "PostgreSQL", "Docker"],
    description:
      "A camera-trap monitoring pipeline for wildlife conservation, heading toward species classification and tiger re-identification. Live today: image ingestion with blur, brightness and contrast checks, perceptual-hash dedup, and an audit trail. In progress.",
    accent: "#7dffb0",
    repo: "https://github.com/harshitjadiya24/SherDrishtiAI2",
  },
  {
    index: "03",
    slug: "moody-player",
    title: "Moody Player",
    year: "2025",
    tags: ["Computer Vision", "face-api.js", "React", "MongoDB"],
    description:
      "Emotion-aware music player. The camera reads your face, classifies mood, and queues tracks that match how you actually feel.",
    accent: "#d8ff4a",
    repo: "https://github.com/harshitjadiya24/Moody-Player",
  },
  {
    index: "04",
    slug: "blog-agent",
    title: "Blog Agent",
    year: "2026",
    tags: ["LangGraph", "Agents", "Ollama", "Python"],
    description:
      "A research-and-write agent graph: a router decides what needs research, an orchestrator plans the post, parallel workers draft each section, and a reducer stitches it into one long-form article. Runs on a local model.",
    accent: "#ff8fd8",
    repo: "https://github.com/harshitjadiya24/Blog-Agent",
  },
  {
    index: "05",
    slug: "spendly",
    title: "Spendly",
    year: "2026",
    tags: ["Flask", "Python", "SQLite", "Security"],
    description:
      "Personal finance app with budget rollovers, loan and EMI tracking, auto-categorisation rules, recurring-payment detection, and a financial health score. Hardened with CSRF checks, rate limits, and security headers.",
    accent: "#9aa8ff",
    repo: "https://github.com/harshitjadiya24/Spendly",
  },
]

/**
 * Nodes of the Skills physics graph, from the LinkedIn headline and summary.
 * `icon` is a key of src/components/skills/icons.ts; each skill links to its group hub.
 */
export const skills = [
  { name: "Python", group: "Core", icon: "python" },
  { name: "C++ / DSA", group: "Core", icon: "cplusplus" },
  { name: "Generative AI", group: "AI" },
  { name: "Agentic AI", group: "AI" },
  { name: "LLMs", group: "AI", icon: "huggingface" },
  { name: "RAG", group: "AI" },
  { name: "Agents", group: "AI" },
  { name: "LangChain", group: "AI", icon: "langchain" },
  { name: "LangGraph", group: "AI", icon: "langgraph" },
  { name: "FastAPI", group: "Backend", icon: "fastapi" },
  { name: "MongoDB", group: "Backend", icon: "mongodb" },
  { name: "Docker", group: "Backend", icon: "docker" },
  { name: "React", group: "Product", icon: "react" },
] as const

export type SkillName = (typeof skills)[number]["name"]

/** Cross-group edges: tools that actually get used together. */
export const skillLinks: [SkillName, SkillName][] = [
  ["Python", "FastAPI"],
  ["Python", "LangChain"],
  ["C++ / DSA", "Python"],
  ["Generative AI", "LLMs"],
  ["Agentic AI", "Agents"],
  ["LLMs", "RAG"],
  ["LLMs", "Agents"],
  ["LangChain", "RAG"],
  ["LangChain", "LangGraph"],
  ["LangGraph", "Agents"],
  ["RAG", "FastAPI"],
  ["FastAPI", "Docker"],
  ["React", "FastAPI"],
]

export const story = [
  {
    k: "01",
    t: "Signal, not noise",
    d: "Pre-final year of ECE at IIIT Nagpur. The degree is electronics; the work is software and AI. FastAPI backends, RAG, agents, and the 150+ LeetCode problems that keep the fundamentals sharp.",
  },
  {
    k: "02",
    t: "Answers you can check",
    d: "A model that sounds right isn't enough. OmniDoc cites every answer down to the clause, re-reads the source page to verify it, and refuses when the evidence isn't there.",
  },
  {
    k: "03",
    t: "Craft is a model too",
    d: "Accuracy without taste is a spreadsheet. I care about latency, typography, and the 200ms that make an interface feel alive.",
  },
]

export const experience = [
  {
    period: "2024 – Present",
    title: "B.Tech ECE",
    org: "IIIT Nagpur",
    description:
      "Pursuing Electronics & Communication Engineering with a focus on AI/ML, computer vision, and real-time systems.",
    accent: "#d8ff4a",
  },
  {
    period: "2025",
    title: "AI Project Lead",
    org: "Self-directed",
    description:
      "Built Moody Player, Neural Chat, and Fraud Sentinel — shipping end-to-end from model training to polished UI.",
    accent: "#6ee7ff",
  },
  {
    period: "2025",
    title: "Hackathon Builder",
    org: "Multiple Events",
    description:
      "Designed and shipped full-stack products under 24–48 hr pressure. Next.js frontends, Python backends, live demos.",
    accent: "#c77dff",
  },
  {
    period: "2025",
    title: "Multi-Agent Systems",
    org: "Research Project",
    description:
      "Architected a backend platform for orchestrating specialized AI agents — moving beyond monolithic prompt engineering.",
    accent: "#ff6b8a",
  },
]

export const stats = [
  { label: "Projects Shipped", value: projects.length },
  { label: "Tech Stack", value: skills.length },
  { label: "LeetCode Solved", value: 150 },
  { label: "Hackathons", value: 3 },
  { label: "Models Trained", value: 8 },
]
