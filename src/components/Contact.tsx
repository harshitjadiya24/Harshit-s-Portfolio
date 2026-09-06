import { profile } from "../data"
import { useFace } from "../face/FaceContext"

export function Contact() {
  const { setExpression } = useFace()

  return (
    <section
      id="contact"
      className="relative z-10 px-5 py-28 md:px-10"
      onMouseEnter={() => setExpression("wink")}
    >
      <p className="mono text-[11px] tracking-[0.28em] text-[#9a9588] uppercase">
        Contact
      </p>
      <h2 className="display mt-4 max-w-[12ch] text-6xl md:text-[7.5rem]">
        Let’s make something <span className="italic text-[#d8ff4a]">unreasonably</span> good.
      </h2>
      <div className="mt-12 flex flex-wrap gap-4">
        <a
          href={`mailto:${profile.email}`}
          className="rounded-full bg-[#d8ff4a] px-8 py-4 text-sm font-medium text-[#111]"
        >
          {profile.email}
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/20 px-8 py-4 text-sm"
        >
          LinkedIn
        </a>
      </div>
      <p className="mt-10 max-w-md text-sm text-[#9a9588]">
        Internships, research collabs, weird AI × design experiments — if it
        involves models and motion, send it.
      </p>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="relative z-10 flex flex-col gap-4 border-t border-white/10 px-5 py-8 text-xs text-[#9a9588] md:flex-row md:items-center md:justify-between md:px-10">
      <p>© {new Date().getFullYear()} Harshit Jadiya</p>
      <p className="mono tracking-[0.16em] uppercase">
        Designed like it costs more than it should
      </p>
    </footer>
  )
}
