# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Recruiters and hiring teams screening for AI/ML engineering internships and full-time roles. They skim fast, often on a laptop between other candidates, and need to quickly see proof that the candidate can build and ship real AI systems, with taste.

## Product Purpose
Personal portfolio for Harshit Jadiya, an AI engineer and product builder (B.Tech ECE, IIIT Nagpur). The site itself is a demonstration of skill: it should prove the craft in its first seconds, then make the next step effortless. Success means the visitor takes any of these three actions: emails Harshit, downloads the resume, or opens the GitHub profile. All three carry equal weight.

## Positioning
An AI engineer who also builds expressive, high-craft interfaces. The models move pixels, products, and people. Most ML candidates show notebooks; this one ships polished, real-time products end to end, from model training to UI.

## Operating Context
- Visitors arrive from resumes, LinkedIn, and applications.
- The contact flow is a CLI-style terminal: `contact` reveals the email, `resume` downloads the PDF.
- GitHub and LinkedIn are linked directly.

## Capabilities and Constraints
- Stack (existing): Vite + React 19, React Three Fiber/Three.js, GSAP (ScrollTrigger, SplitText), Lenis, Motion, Tailwind 4.
- WebGL is a progressive enhancement. The content must still read when WebGL is unavailable and under reduced motion.
- Resume lives at `/resume.pdf`. It is not yet in the repo; the user will add it.
- The particle avatar is built from `public/face.webp`, a cut-out of the user's studio portrait. If it fails to load, a procedural head is used.

## Brand Commitments
- Name: Harshit Jadiya. Title line: "AI Engineer / Architect".
- Voice: confident, terse, a little wry ("Accuracy without taste is a spreadsheet.").

## Evidence on Hand
Confirmed accurate by the user (all in `src/data.ts`):
- Projects: Moody Player, with its description. Neural Chat, Fraud Sentinel, MAS Platform and Hackathon Lab were removed from the site at the user's request (2026-10-11).
- Projects taken from public GitHub repos (descriptions limited to what the README or code shows): OmniDoc RAG (live at omnidoc-rag.vercel.app), VanRakshak AI (repo SherDrishtiAI2; only the ingestion phase is built, so it is described as in progress), Blog Agent, and Spendly.
- Stats: 3 hackathons, 8 models trained. Project and stack counts are computed from `data.ts`.
- From the LinkedIn profile (2026-10-11): pre-final-year B.Tech ECE at IIIT Nagpur (started August 2024); headline Generative AI, Agentic AI, LLMs, RAG, FastAPI, Machine Learning, Docker, DSA (C++); backend in Python/FastAPI with MySQL, PostgreSQL, SQLite, MongoDB; Docker and Kubernetes; deploys on Vercel; LoRA/QLoRA fine-tuning, embeddings, vector databases; 150+ LeetCode problems solved; OmniDoc named as the key project.
- Contact: harshitjadiya24@gmail.com (set by the user 2026-10-12; replaced the LinkedIn address), linkedin.com/in/harshit-jadiya24, and GitHub (harshitjadiya24).

Absent, so do not fabricate: testimonials, employers or internships, project screenshots or videos (placeholders are generated until real media is added under `public/work/`), and the resume PDF.

## Product Principles
1. The site is the proof: every interaction should demonstrate engineering plus taste, not just describe it.
2. Respect the skim: a recruiter gets name, role, and a path to contact within the first viewport.
3. Equal-weight exits: email, resume, and GitHub are always reachable.
4. Truth only: no invented metrics or claims beyond the evidence above.

## Accessibility & Inclusion
- Honor `prefers-reduced-motion`.
- Content and contact info stay available without WebGL or JS-heavy interactions. This means the terminal has plain-link fallbacks.
