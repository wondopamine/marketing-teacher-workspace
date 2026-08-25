import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"
import react from "@vitejs/plugin-react"

import { mdxContent } from "./src/content/mdx-plugin"

export default defineConfig({
  plugins: [mdxContent(), react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
    css: false,
  },
})
