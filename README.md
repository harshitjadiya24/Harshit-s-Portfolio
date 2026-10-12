# Harshit Jadiya — Portfolio

Personal portfolio of **Harshit Jadiya**, AI engineer (Generative and Agentic AI) and pre-final-year B.Tech ECE student at IIIT Nagpur.

The site is an interactive, WebGL-driven single page. A particle portrait in the hero morphs into a neural network, then into a data cube, as you scroll. Below it come a draggable physics graph of the tech stack, liquid-hover project showcases, a certifications list, a working CLI terminal for contact, and a full-screen **Hire Me** page.

- **GitHub:** [harshitjadiya24](https://github.com/harshitjadiya24)
- **LinkedIn:** [harshit-jadiya24](https://www.linkedin.com/in/harshit-jadiya24/)
- **Email:** harshitjadiya24@gmail.com

---

## Contents

1. [What's on the site](#whats-on-the-site)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Scripts](#scripts)
5. [Project structure](#project-structure)
6. [Editing content](#editing-content)
7. [How the visuals work](#how-the-visuals-work)
8. [Performance and accessibility](#performance-and-accessibility)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Credits](#credits)

---

## What's on the site

| Section | What it does |
|---|---|
| **Loader** | A counter runs while fonts load and the portrait is sampled into particles, then the curtain lifts. |
| **Hero** | Title reading "AI ENGINEER / ARCHITECT", with characters swinging in from depth and blur. Harshit's portrait is rendered as ~70,000 particles that scatter away from the cursor and reform. The magnetic **Initialize** button scrolls to About. |
| **About** | A short statement that fills with colour as you scroll, plus three notes: Backend, AI and Fundamentals. Behind it, the portrait morphs into a 3D neural network with signal pulses travelling along its edges. |
| **Stack** | A physics graph of the skills, grouped into Core, AI, Backend and Product. Nodes repel the cursor, can be dragged and thrown, and bump into each other. Hovering a node highlights its connections. |
| **Work** | Five projects as full-width rows. Each image wipes in on scroll, and hovering floods it with a liquid, glitchy transition into a live preview. OmniDoc plays its intro film in a framed window. Rows link to the live demo and source. A 3D data cube travels through the section, moving into whatever space is free of text. |
| **Certified** | Certificates as rows. Hover shows the certificate image; click opens the issuer's verification page. |
| **Contact** | A working terminal that boots when scrolled into view. It also has quick-command buttons and plain links underneath. |
| **Hire Me** | A full-screen page opened from the nav, also reachable at `/#hire`. It lists email (with copy), LinkedIn, GitHub, resume, and a phone number if one is set. Closes with Esc, the Close button or browser back. |

### Terminal commands

| Command | Result |
|---|---|
| `help` | Lists commands |
| `contact` | Shows the email and copies it to the clipboard |
| `resume` | Downloads `resume.pdf`, or explains that it isn't uploaded yet |
| `whoami` | Name, role, school, location |
| `projects [name]` | Lists projects, or jumps to one |
| `skills` | The stack, grouped |
| `socials`, `github`, `linkedin` | Links, or opens them in a new tab |
| `date` | Local time in Nagpur (IST) |
| `clear` | Clears the screen (also `Ctrl+L`) |

The terminal also has Tab completion, ↑/↓ history, and "did you mean" suggestions for typos.

### Projects featured

| Project | Summary | Links |
|---|---|---|
| **OmniDoc RAG** | Ask questions about your PDFs and get answers you can check. Hybrid BM25 and vector retrieval with cross-encoder rerank, streaming answers cited to document and page, and a page check on every citation. It refuses to answer when the evidence isn't there. | [Live](https://omnidoc-rag.vercel.app/) · [Source](https://github.com/harshitjadiya24/OmniDoc-RAG) |
| **VanRakshak AI** | A camera-trap monitoring pipeline for wildlife conservation (in progress). Built so far: image ingestion, quality checks, perceptual-hash dedup and an audit trail. | [Source](https://github.com/harshitjadiya24/SherDrishtiAI2) |
| **Moody Player** | An emotion-aware music player: the camera reads your expression and queues matching tracks. | [Source](https://github.com/harshitjadiya24/Moody-Player) |
| **Blog Agent** | A LangGraph research-and-write agent: router, planner, parallel section writers and a reducer, running on a local model. | [Source](https://github.com/harshitjadiya24/Blog-Agent) |
| **Spendly** | A Flask finance app with budgets, EMI tracking, auto-categorisation, recurring-payment detection and a health score. | [Source](https://github.com/harshitjadiya24/Spendly) |

---

## Tech stack

| Area | Tools |
|---|---|
| Framework | [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Vite 8](https://vite.dev) |
| 3D / WebGL | [Three.js](https://threejs.org), [React Three Fiber](https://r3f.docs.pmnd.rs), custom GLSL shaders |
| Scroll | [Lenis](https://lenis.darkroom.engineering) smooth scroll, synced to [GSAP](https://gsap.com) ScrollTrigger |
| Animation | GSAP (SplitText, CustomEase, ScrollTrigger), [Motion](https://motion.dev) for UI micro-interactions |
| Physics graph | [d3-force](https://d3js.org/d3-force) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) with CSS design tokens |
| Icons | [Simple Icons](https://simpleicons.org); only the icons used are bundled |
| Lint | [Oxlint](https://oxc.rs) |

---

## Getting started

**Requirements:** [Node.js](https://nodejs.org) 20.19+ or 22.12+ (Vite 8 needs one of these) and npm.

```bash
git clone https://github.com/harshitjadiya24/Harshit-s-Portfolio.git
cd Harshit-s-Portfolio
npm install
npm run dev
```

Then open **http://localhost:5173**. Edits reload instantly.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Type-checks (`tsc -b`), then builds the production site into `dist/` |
| `npm run preview` | Serves the built `dist/` locally, to check the production build |
| `npm run lint` | Runs Oxlint |

---

## Project structure

```
public/
  face.webp                  Cut-out portrait the particle avatar is built from
  work/omnidoc-rag.mp4       OmniDoc intro film (project hover video)
  certificates/              Certificate images (hover previews)
  fonts/                     Self-hosted Clash Display
  resume.pdf                 Add this file; the site links to it
src/
  data.ts                    ★ All site content: profile, about, projects, skills, certifications
  App.tsx                    Page shell: Lenis + GSAP sync, section order
  index.css                  Design tokens (colours, fonts, easing) and global styles
  components/
    Hero, About, Skills, Work, Certifications, Contact, Nav, Loader, Cursor
    HireMe.tsx, hire.ts      Full-screen Hire Me page (#hire)
    MagneticButton.tsx       Buttons that pull toward the cursor
    skills/                  Physics graph (SkillGraph) and icon map
    terminal/                Terminal UI and its command table
  motion/
    eases.ts                 Shared GSAP setup and easing curves
    splitReveal.ts           Character-by-character 3D title entrance
  scene/                     Everything WebGL
    Stage.tsx                The single fixed canvas behind the page
    scrollStory.ts           Scroll positions → particle shape, position, fade
    sceneState.ts            Shared scene state, colour palette, quality settings
    avatar/                  Particle portrait: photo sampling, shaders, morph targets
    work/                    Project hover planes, posters, video loading
```

---

## Editing content

Almost everything is in **`src/data.ts`**. Change it, save, and the site updates.

### Profile and contact

```ts
export const profile = {
  name: "Harshit Jadiya",
  role: "AI Engineer · Generative & Agentic AI",
  school: "B.Tech ECE · IIIT Nagpur",
  location: "Nagpur, India",
  email: "harshitjadiya24@gmail.com",
  linkedin: "https://www.linkedin.com/in/harshit-jadiya24/",
  github: "https://github.com/harshitjadiya24",
  phone: "",          // set it to show a Phone row on the Hire Me page
  tagline: "...",
}
```

The email and links feed the terminal, the Hire Me page and the contact links all at once.

### About

- `about` is the statement. Wrap a word in `*asterisks*` to make it fill green.
- `aboutNotes` holds the three notes under the statement.

### Projects

Add an object to `projects`:

```ts
{
  index: "06",
  slug: "my-project",                    // unique, used in file names
  title: "My Project",
  year: "2026",
  tags: ["Python", "FastAPI"],
  description: "One or two sentences.",
  accent: "#7dffb0",                     // the project's colour
  repo: "https://github.com/...",        // optional: "Source ↗" link
  live: "https://...",                   // optional: "Live ↗" link
  poster: "/work/my-project.jpg",        // optional: real thumbnail
  video: "/work/my-project.mp4",         // optional: plays in a frame on hover
}
```

Without a `poster`, a typographic poster is generated in the project's colour. Put media files in `public/work/`. Keep videos small: about 960×540 and under 15 MB, since they only load on hover.

### Skills

- Add a node to `skills`: `{ name, group, icon }`. Groups become the big labels in the graph.
- `icon` is a key from `src/components/skills/icons.ts`. To add a new icon, import it from `simple-icons` there (for example `siDocker`) and add a key. `icon` is optional.
- `skillLinks` lists the extra connections between related skills.

### Certifications

```ts
{
  title: "IBM RAG and Agentic AI",
  issuer: "IBM · Coursera",
  year: "2026",
  image: "/certificates/ibm-rag-agentic-ai.webp",   // hover preview
  url: "https://coursera.org/verify/...",           // click target
}
```

Put the image in `public/certificates/`. A WebP about 1100 px wide works well. The section and its nav link stay hidden while the list is empty.

### Resume

Save the PDF as **`public/resume.pdf`**. The terminal's `resume` command, the Hire Me page and the contact links all use it.

### Portrait

The particle portrait is built from **`public/face.webp`** when the page loads. To change it:

1. Use a front-facing head-and-shoulders photo.
2. Cut out the background so it's transparent (any background-removal tool works), and save it as `public/face.webp` or a PNG.
3. A plain photo on a flat, even backdrop also works without a cutout.

If the image fails to load, a sculpted procedural head is used instead.

---

## How the visuals work

- **One canvas.** The whole site shares one fixed WebGL canvas behind the page (`scene/Stage.tsx`). Project hover planes are drawn into it and aligned to their page positions every frame, so there's never a second WebGL context.
- **Particle portrait** (`scene/avatar/`):
  - `sampleFace.ts` reads the cut-out photo, finds the head, and places particles by tone. Brighter areas get more dots, the face gets extra density, and simple lighting gives it volume.
  - Each particle also stores a position on a neural-network graph and on a data cube (`targets.ts`). The vertex shader (`shaders.ts`) blends between these three shapes.
  - The cursor scatters particles near it, and they reform when it leaves.
- **Scroll story** (`scene/scrollStory.ts`): GSAP ScrollTrigger maps each section to a shape, position and opacity: face → neural graph → cube → scattered cloud. In Work, `freeSpot.ts` moves the cube into whatever area of the screen is free of text.
- **Liquid hover** (`scene/work/LiquidPlane.tsx`): a shader blends the poster into the preview with a noise-driven ripple from the cursor, colour fringing and torn slices.
- **One clock.** Lenis, GSAP and the WebGL render all run on GSAP's ticker, so scrolling, animations and 3D stay in sync.

---

## Performance and accessibility

- **Lighter on phones:** phones and low-core devices get fewer particles (24k instead of 70k) and a lower pixel ratio.
- **Loads only when needed:** the stack graph only simulates while it's on screen. Project videos download and play only on hover.
- **Without WebGL:** the 3D layer is skipped, and all text, projects and contact links still work.
- **Reduced motion:** with `prefers-reduced-motion`, animations are switched off or shortened, and the stack graph settles into a static layout.
- **Screen readers and keyboard:** the hidden skills list, the terminal's live output region and the Hire Me dialog are all labelled for screen readers, and every control has a visible focus ring.

---

## Deployment

This is a static site: `npm run build` produces plain files in `dist/`, so any static host works, usually for free.

### Vercel (recommended, free Hobby plan)

1. Push the repo to GitHub.
2. On [vercel.com](https://vercel.com), go to **Add New → Project** and import this repository.
3. Vercel detects Vite. Confirm these settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Click **Deploy**.

After that, every push to the production branch redeploys automatically, and other branches get preview links. No config file is needed; the Hire Me page uses a `#hire` hash, so routing works on any static host.

### Netlify or Cloudflare Pages

Connect the repository, set the build command to `npm run build` and the publish directory to `dist`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm run dev` fails on startup | Check your Node version with `node -v`; it must be 20.19+ or 22.12+. |
| The portrait is a generic head | `public/face.webp` is missing or failed to load. |
| `resume` says the file isn't uploaded | Add `public/resume.pdf`. |
| No 3D effects | The browser or device has WebGL2 turned off. The site still works without it. |
| A project has no hover video | Check that the `video` path in `data.ts` matches a file in `public/work/`. |

---

## Credits

- **Display font:** [Clash Display](https://www.fontshare.com/fonts/clash-display) by Indian Type Foundry, via Fontshare (self-hosted in `public/fonts/`).
- **Mono font:** [JetBrains Mono](https://www.jetbrains.com/lp/mono/), via Google Fonts.
- **Brand icons:** [Simple Icons](https://simpleicons.org) (CC0).
- **Noise:** simplex noise in the shaders adapted from Ashima Arts (MIT).

Designed and built by Harshit Jadiya.
