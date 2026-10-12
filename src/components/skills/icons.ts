import {
  siCplusplus,
  siDocker,
  siFastapi,
  siGit,
  siGithub,
  siHuggingface,
  siJavascript,
  siLangchain,
  siLanggraph,
  siMongodb,
  siPython,
  siReact,
  siTailwindcss,
} from "simple-icons"

/** Named imports only, so the bundle carries these paths, not the whole set. */
export const icons = {
  python: siPython,
  cplusplus: siCplusplus,
  git: siGit,
  github: siGithub,
  huggingface: siHuggingface,
  langchain: siLangchain,
  langgraph: siLanggraph,
  fastapi: siFastapi,
  mongodb: siMongodb,
  docker: siDocker,
  react: siReact,
  javascript: siJavascript,
  tailwind: siTailwindcss,
}

export type IconKey = keyof typeof icons
