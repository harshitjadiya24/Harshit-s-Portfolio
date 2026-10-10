export const profile = {
  name: "Harshit Jadiya",
  role: "AI Engineer & Product Builder",
  school: "IIIT Nagpur · ECE",
  location: "Nagpur, India",
  email: "bt24eci044@iiitn.ac.in",
  linkedin: "https://www.linkedin.com/in/harshit-jadiya-82b27127b",
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
  poster?: string
  video?: string
}[] = [
  {
    index: "01",
    slug: "moody-player",
    title: "Moody Player",
    year: "2025",
    tags: ["Computer Vision", "face-api.js", "React", "MongoDB"],
    description:
      "Emotion-aware music player. The camera reads your face, classifies mood, and queues tracks that match how you actually feel.",
    accent: "#d8ff4a",
  },
  {
    index: "02",
    slug: "neural-chat",
    title: "Neural Chat",
    year: "2025",
    tags: ["Realtime", "Socket.IO", "LLM UI", "Vite"],
    description:
      "A live AI conversation surface — streaming replies, presence, and a UI tuned for long-form thinking rather than chat bubbles that die.",
    accent: "#6ee7ff",
  },
  {
    index: "03",
    slug: "fraud-sentinel",
    title: "Fraud Sentinel",
    year: "2025",
    tags: ["ML", "Python", "Classification", "Finance"],
    description:
      "Credit-card fraud detection on 10k+ transactions. Feature work, model comparison, and a lens on false positives that actually matter.",
    accent: "#c77dff",
  },
  {
    index: "04",
    slug: "mas-platform",
    title: "MAS Platform",
    year: "2025",
    tags: ["Multi-agent", "Backend", "APIs"],
    description:
      "Backend for a multi-agent stack — orchestrating specialized agents instead of one giant prompt pretending to be everything.",
    accent: "#ff6b8a",
  },
  {
    index: "05",
    slug: "hackathon-lab",
    title: "Hackathon Lab",
    year: "2025",
    tags: ["Next.js", "Speed", "Product"],
    description:
      "Shipped under pressure: Next.js frontend, Python backend, and a product story tight enough to demo in minutes.",
    accent: "#e7cba0",
  },
]

/**
 * Nodes of the Skills physics graph. `icon` is a simple-icons export name
 * (see src/components/skills/icons.ts); each skill links to its group hub.
 */
export const skills = [
  { name: "Python", group: "Core", icon: "python" },
  { name: "TypeScript", group: "Core", icon: "typescript" },
  { name: "C / DSA", group: "Core", icon: "c" },
  { name: "PyTorch", group: "AI", icon: "pytorch" },
  { name: "CUDA", group: "AI", icon: "nvidia" },
  { name: "LLMs", group: "AI", icon: "huggingface" },
  { name: "Computer Vision", group: "AI", icon: "opencv" },
  { name: "React", group: "Product", icon: "react" },
  { name: "Three.js", group: "Product", icon: "three" },
  { name: "UI Motion", group: "Product", icon: "gsap" },
  { name: "Node.js", group: "Systems", icon: "node" },
  { name: "MongoDB", group: "Systems", icon: "mongodb" },
  { name: "Socket.IO", group: "Systems", icon: "socketio" },
] as const

export type SkillName = (typeof skills)[number]["name"]

/** Cross-group edges: tools that actually get used together. */
export const skillLinks: [SkillName, SkillName][] = [
  ["Python", "PyTorch"],
  ["PyTorch", "CUDA"],
  ["PyTorch", "Computer Vision"],
  ["TypeScript", "React"],
  ["React", "Three.js"],
  ["Three.js", "UI Motion"],
  ["TypeScript", "Node.js"],
  ["Node.js", "Socket.IO"],
  ["Node.js", "MongoDB"],
  ["LLMs", "Socket.IO"],
  ["C / DSA", "CUDA"],
]

export const story = [
  {
    k: "01",
    t: "Signal, not noise",
    d: "ECE at IIIT Nagpur taught me systems. AI taught me behavior. I live in the overlap — models that move pixels, products, and people.",
  },
  {
    k: "02",
    t: "Faces as interfaces",
    d: "Moody Player started as a question: if software can see you, why does it still ignore how you feel? Expression is a first-class input.",
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
  { label: "Projects Shipped", value: 5 },
  { label: "Tech Stack", value: 12 },
  { label: "Hackathons", value: 3 },
  { label: "Models Trained", value: 8 },
]
