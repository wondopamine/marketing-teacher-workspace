/**
 * Generates responsive image variants for the product screenshot, plus the
 * modern-format variants of the decorative halftone cloud.
 *
 * Reads public/hero/profiles-screen.png (source — 1600×1000, sRGB)
 * and writes 12 variants to public/hero/:
 *   profiles-screen-{640,960,1280,1600}.{avif,webp,png}
 *
 * Reads public/hero/cloud-halftone.png (source — 1274×1274, alpha) and writes
 * public/hero/cloud-halftone.{avif,webp} at native size. The GA hero draws
 * that cloud twice, so its 1.1MB PNG spent the whole mobile first-paint budget
 * on a throttled link (measured 2026-08-24: mobile FCP 5.55s). The AVIF is
 * ~63KB, a composited mean delta of 0.47/255 against the PNG over the sky.
 *
 * Idempotent: skips outputs newer than the input mtime, so repeated
 * `pnpm gen:hero-images` runs are cheap. Source PNGs are preserved.
 *
 * Per CONTEXT.md D-10: manual + commit (no prebuild hook). Per D-11:
 * widths 640/960/1280/1600. Quality settings per RESEARCH.md Pattern 2.
 *
 * Usage: node scripts/gen-hero-images.mjs (or pnpm gen:hero-images)
 */
import sharp from "sharp"
import { existsSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(__dirname, "..", "public", "hero", "profiles-screen.png")
const CLOUD_SOURCE = resolve(
  __dirname,
  "..",
  "public",
  "hero",
  "cloud-halftone.png"
)
const OUT_DIR = resolve(__dirname, "..", "public", "hero")
const WIDTHS = [640, 960, 1280, 1600]
const FORMATS = [
  { ext: "avif", method: "avif", opts: { quality: 60, effort: 4 } },
  { ext: "webp", method: "webp", opts: { quality: 78, effort: 4 } },
  { ext: "png", method: "png", opts: { compressionLevel: 9 } },
]
/** The cloud keeps its PNG source as the fallback tier, so no PNG variant. */
const CLOUD_FORMATS = FORMATS.filter((format) => format.ext !== "png")

function shouldRegenerate(inPath, outPath) {
  if (!existsSync(outPath)) return true
  return statSync(inPath).mtimeMs > statSync(outPath).mtimeMs
}

for (const source of [SOURCE, CLOUD_SOURCE]) {
  if (!existsSync(source)) {
    console.error(`ERROR: source not found: ${source}`)
    process.exit(1)
  }
}

for (const width of WIDTHS) {
  for (const { ext, method, opts } of FORMATS) {
    const outPath = resolve(OUT_DIR, `profiles-screen-${width}.${ext}`)
    if (!shouldRegenerate(SOURCE, outPath)) {
      console.log(`✓ skip ${outPath}`)
      continue
    }
    await sharp(SOURCE)
      .resize(width, null, { withoutEnlargement: true })
      .withMetadata()
      [method](opts)
      .toFile(outPath)
    console.log(`✓ wrote ${outPath}`)
  }
}

for (const { ext, method, opts } of CLOUD_FORMATS) {
  const outPath = resolve(OUT_DIR, `cloud-halftone.${ext}`)
  if (!shouldRegenerate(CLOUD_SOURCE, outPath)) {
    console.log(`✓ skip ${outPath}`)
    continue
  }
  await sharp(CLOUD_SOURCE).withMetadata()[method](opts).toFile(outPath)
  console.log(`✓ wrote ${outPath}`)
}
