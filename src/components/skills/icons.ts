import {
  siCplusplus,
  siDocker,
  siFastapi,
  siHuggingface,
  siLangchain,
  siLanggraph,
  siMongodb,
  siPython,
  siReact,
} from "simple-icons"

/** Named imports only, so the bundle carries these paths, not the whole set. */
export const icons = {
  python: siPython,
  cplusplus: siCplusplus,
  huggingface: siHuggingface,
  langchain: siLangchain,
  langgraph: siLanggraph,
  fastapi: siFastapi,
  mongodb: siMongodb,
  docker: siDocker,
  react: siReact,
}

export type IconKey = keyof typeof icons
