import { profile, projects, skills } from "../../data"

export type Tone = "in" | "out" | "dim" | "ok" | "err" | "accent"
/** A plain string, or an emphasised span; with `href` it becomes a link. */
export type Part = string | { text: string; href?: string; download?: string; external?: boolean }
export type Line = { tone: Tone; parts: Part[] }

export type Ctx = {
  print: (...lines: Line[]) => void
  clear: () => void
  history: () => string[]
  scrollTo: (target: string) => void
}

type Command = {
  name: string
  help: string
  hidden?: boolean
  run: (args: string[], ctx: Ctx) => void | Promise<void>
}

export const RESUME_URL = "/resume.pdf"
const RESUME_NAME = "Harshit-Jadiya-Resume.pdf"

const line = (tone: Tone, ...parts: Part[]): Line => ({ tone, parts })
const out = (...parts: Part[]) => line("out", ...parts)
const dim = (...parts: Part[]) => line("dim", ...parts)
const pad = (s: string, n: number) => s + " ".repeat(Math.max(1, n - s.length))

const socials = [
  { name: "github", href: profile.github },
  { name: "linkedin", href: profile.linkedin },
]

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function openLink(name: string, href: string, ctx: Ctx) {
  const win = window.open(href, "_blank", "noopener,noreferrer")
  ctx.print(
    win
      ? line("ok", `opening ${name} in a new tab`)
      : line("dim", "popup blocked — follow the link: ", { text: href, href, external: true }),
  )
}

/** Vite and most static hosts answer unknown paths with index.html, so check the type too. */
async function resumeExists() {
  try {
    const r = await fetch(RESUME_URL, { method: "HEAD", cache: "no-store" })
    return r.ok && (r.headers.get("content-type") ?? "").includes("pdf")
  } catch {
    return false
  }
}

const commands: Command[] = [
  {
    name: "help",
    help: "list commands",
    run: (_, ctx) =>
      ctx.print(
        ...commands.filter((c) => !c.hidden).map((c) => line("dim", { text: pad(c.name, 11) }, c.help)),
        dim("tab completes · ↑ ↓ walks history · ctrl+l clears"),
      ),
  },
  {
    name: "contact",
    help: "reveal my email (and copy it)",
    run: async (_, ctx) => {
      const copied = await copy(profile.email)
      ctx.print(
        out("email     ", { text: profile.email, href: `mailto:${profile.email}` }),
        copied ? line("ok", "copied to clipboard") : dim("select it, or click to open your mail app"),
        dim("I reply within a day. Internships and full-time AI roles welcome."),
      )
    },
  },
  {
    name: "resume",
    help: "download my resume (PDF)",
    run: async (_, ctx) => {
      ctx.print(dim("locating resume.pdf ..."))
      if (!(await resumeExists())) {
        ctx.print(line("err", "resume.pdf isn't uploaded yet. Run `contact` and I'll send it directly."))
        return
      }
      const a = document.createElement("a")
      a.href = RESUME_URL
      a.download = RESUME_NAME
      document.body.append(a)
      a.click()
      a.remove()
      ctx.print(
        line("ok", "download started"),
        dim("didn't start? ", { text: RESUME_NAME, href: RESUME_URL, download: RESUME_NAME }),
      )
    },
  },
  {
    name: "whoami",
    help: "who's on the other end",
    run: (_, ctx) =>
      ctx.print(
        line("accent", profile.name),
        out(profile.role),
        dim(`${profile.school} · ${profile.location}`),
        out(profile.tagline),
      ),
  },
  {
    name: "projects",
    help: "list shipped work · `projects <name>` jumps to it",
    run: (args, ctx) => {
      const q = args.join(" ").toLowerCase()
      if (q) {
        const hit = projects.find((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q))
        if (!hit) return ctx.print(line("err", `no project matching "${q}"`))
        ctx.print(line("ok", `jumping to ${hit.title}`))
        ctx.scrollTo("#work")
        return
      }
      ctx.print(...projects.map((p) => out(pad(p.title, 16), { text: `${p.year} · ${p.tags.slice(0, 2).join(", ")}` })))
    },
  },
  {
    name: "skills",
    help: "the stack, by group",
    run: (_, ctx) => {
      const groups = [...new Set(skills.map((s) => s.group))]
      ctx.print(
        ...groups.map((g) =>
          out(pad(g.toLowerCase(), 10), {
            text: skills
              .filter((s) => s.group === g)
              .map((s) => s.name)
              .join(" · "),
          }),
        ),
      )
    },
  },
  {
    name: "socials",
    help: "github + linkedin",
    run: (_, ctx) =>
      ctx.print(...socials.map((s) => out(pad(s.name, 10), { text: s.href, href: s.href, external: true }))),
  },
  { name: "github", help: "open github", run: (_, ctx) => openLink("github", profile.github, ctx) },
  { name: "linkedin", help: "open linkedin", run: (_, ctx) => openLink("linkedin", profile.linkedin, ctx) },
  {
    name: "date",
    help: "local time in Nagpur",
    run: (_, ctx) =>
      ctx.print(
        out(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "medium",
          }).format(new Date()) + " IST",
        ),
      ),
  },
  { name: "clear", help: "wipe the screen", run: (_, ctx) => ctx.clear() },
  {
    name: "history",
    help: "",
    hidden: true,
    run: (_, ctx) => ctx.print(...ctx.history().map((h, i) => dim(pad(String(i + 1), 4), h))),
  },
  { name: "echo", help: "", hidden: true, run: (args, ctx) => ctx.print(out(args.join(" "))) },
  {
    name: "sudo",
    help: "",
    hidden: true,
    run: async (args, ctx) => {
      if (args.join(" ") === "hire-me") {
        ctx.print(line("accent", "privilege escalated. offer letter pipeline engaged."))
        await run("contact", ctx)
        return
      }
      ctx.print(line("err", "permission denied. try `sudo hire-me`"))
    },
  },
]

export const commandNames = commands.filter((c) => !c.hidden).map((c) => c.name)
const allNames = [...commands.map((c) => c.name), "sudo hire-me"]

function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

export async function run(input: string, ctx: Ctx) {
  const [name, ...args] = input.trim().split(/\s+/)
  if (!name) return
  const cmd = commands.find((c) => c.name === name.toLowerCase())
  if (cmd) return cmd.run(args, ctx)
  const best = commandNames
    .map((n) => ({ n, d: distance(name.toLowerCase(), n) }))
    .sort((a, b) => a.d - b.d)[0]
  ctx.print(
    line("err", `command not found: ${name}`),
    best && best.d <= 3 ? dim("did you mean ", { text: best.n }, "?") : dim("type `help`"),
  )
}

/** Tab completion: the unique match, or the shared prefix plus the candidates. */
export function complete(input: string): { value: string; options: string[] } {
  const q = input.trimStart().toLowerCase()
  if (!q) return { value: input, options: [] }
  const hits = allNames.filter((n) => n.startsWith(q))
  if (hits.length === 1) return { value: hits[0] + " ", options: [] }
  if (!hits.length) return { value: input, options: [] }
  let prefix = hits[0]
  for (const h of hits) while (!h.startsWith(prefix)) prefix = prefix.slice(0, -1)
  return { value: prefix, options: hits }
}
