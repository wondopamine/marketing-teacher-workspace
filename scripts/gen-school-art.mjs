/**
 * Generates the web variants of the Real schools testimonial illustrations.
 *
 * Reads the 2048×2048 sources from assets/schools/ — named for the testimonial
 * each one sits beside — and writes public/schools/{id}-{320,640}.{avif,webp}.
 *
 * The sources sit outside public/ on purpose: they are 2–3MB each and nothing
 * should be able to serve them by accident. They stay in the repo so this
 * script is re-runnable.
 *
 * Alpha is preserved: the drawings are line art on transparency and sit
 * directly on the card, so flattening them onto white would put a hard square
 * edge inside a rounded frame. Quality runs a little above the photographic
 * settings in `gen-reveal-photos.mjs` — flat colour behind heavy black strokes
 * is where lossy codecs ring, and it costs a few KB to avoid.
 *
 * Idempotent: skips outputs newer than their input, so repeated runs are cheap.
 *
 * Usage: node scripts/gen-school-art.mjs (or pnpm gen:school-art)
 */
import sharp from "sharp"
import { existsSync, readdirSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = resolve(__dirname, "..", "assets", "schools")
const OUT_DIR = resolve(__dirname, "..", "public", "schools")

/** The media column tops out near 290px, so 640 covers a 2× screen. */
const WIDTHS = [320, 640]
const FORMATS = [
  { ext: "avif", method: "avif", opts: { quality: 62, effort: 4 } },
  { ext: "webp", method: "webp", opts: { quality: 82, effort: 4 } },
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
  const id = name.replace(/\.png$/, "")
  for (const width of WIDTHS) {
    for (const { ext, method, opts } of FORMATS) {
      const outPath = resolve(OUT_DIR, `${id}-${width}.${ext}`)
      if (
        existsSync(outPath) &&
        statSync(source).mtimeMs <= statSync(outPath).mtimeMs
      ) {
        console.log(`✓ skip ${outPath}`)
        continue
      }
      await sharp(source)
        .resize(width, width, { fit: "inside", withoutEnlargement: true })
        [method](opts)
        .toFile(outPath)
      console.log(`✓ wrote ${outPath}`)
    }
  }
}
