/**
 * Generates the web variants of the reveal section's teacher photographs.
 *
 * Reads the five 1024×1024 sources from assets/reveal/ — named for the journey
 * act each one belongs to, which is also the vignette on the back of its card —
 * and writes assets/…/public/reveal/{act}-{320,640}.{avif,webp}.
 *
 * The sources sit outside public/ on purpose: they are 1.3–1.5MB each and
 * nothing should be able to serve them by accident. They stay in the repo so
 * this script is re-runnable — the scatter's cards are small (185–260px), so
 * the served variants are two orders of magnitude lighter than the source.
 *
 * Idempotent: skips outputs newer than their input, so repeated runs are cheap.
 *
 * Usage: node scripts/gen-reveal-photos.mjs (or pnpm gen:reveal-photos)
 */
import sharp from "sharp"
import { existsSync, readdirSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = resolve(__dirname, "..", "assets", "reveal")
const OUT_DIR = resolve(__dirname, "..", "public", "reveal")

/** The cards top out around 260px, so 640 covers a 2× screen with room. */
const WIDTHS = [320, 640]
const FORMATS = [
  { ext: "avif", method: "avif", opts: { quality: 52, effort: 4 } },
  { ext: "webp", method: "webp", opts: { quality: 74, effort: 4 } },
]

if (!existsSync(SOURCE_DIR)) {
  console.error(`ERROR: source directory not found: ${SOURCE_DIR}`)
  process.exit(1)
}

const sources = readdirSync(SOURCE_DIR).filter((name) => name.endsWith(".png"))
if (sources.length === 0) {
  console.error(`ERROR: no .png sources in ${SOURCE_DIR}`)
  process.exit(1)
}

for (const name of sources) {
  const source = resolve(SOURCE_DIR, name)
  const act = name.replace(/\.png$/, "")
  for (const width of WIDTHS) {
    for (const { ext, method, opts } of FORMATS) {
      const outPath = resolve(OUT_DIR, `${act}-${width}.${ext}`)
      if (
        existsSync(outPath) &&
        statSync(source).mtimeMs <= statSync(outPath).mtimeMs
      ) {
        console.log(`✓ skip ${outPath}`)
        continue
      }
      await sharp(source)
        .resize(width, width, { fit: "cover", withoutEnlargement: true })
        [method](opts)
        .toFile(outPath)
      console.log(`✓ wrote ${outPath}`)
    }
  }
}
