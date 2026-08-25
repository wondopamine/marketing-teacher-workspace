/**
 * Singapore, as a dot lattice.
 *
 * The coastline below is a *stylised* outline — enough vertices to read as
 * Singapore once it is punched out into 15-unit dots, not a survey. It exists
 * to give the Real schools section a ground the testimonial cards can grow out
 * of; nothing here is a geographic claim, and the anchors are markers on a
 * drawing, not school locations (ADR 0003: role and school level only, never a
 * school, never a place).
 *
 * Everything is derived once at module load: the bounds, the projection, the
 * silhouette path, and the lattice. That keeps the drawing editable as
 * coordinates — move a vertex and the dots follow — at the cost of one pass
 * over ~2,500 grid cells, which is a fraction of a millisecond.
 */

/** `[longitude, latitude]`, the order GeoJSON uses. */
type Point = readonly [number, number]
type Ring = ReadonlyArray<Point>

const MAIN_ISLAND: Ring = [
  [103.607, 1.329],
  [103.618, 1.345],
  [103.636, 1.362],
  [103.648, 1.383],
  [103.657, 1.4],
  [103.673, 1.42],
  [103.69, 1.442],
  [103.706, 1.451],
  [103.725, 1.457],
  [103.744, 1.452],
  [103.76, 1.458],
  [103.777, 1.466],
  [103.796, 1.462],
  [103.812, 1.455],
  [103.828, 1.457],
  [103.845, 1.462],
  [103.862, 1.458],
  [103.876, 1.448],
  [103.889, 1.437],
  [103.903, 1.43],
  [103.918, 1.424],
  [103.932, 1.414],
  [103.948, 1.404],
  [103.962, 1.395],
  [103.977, 1.391],
  [103.99, 1.386],
  [104.002, 1.378],
  [104.01, 1.365],
  [104.008, 1.349],
  [104.0, 1.336],
  [103.99, 1.325],
  [103.977, 1.315],
  [103.962, 1.308],
  [103.945, 1.302],
  [103.928, 1.298],
  [103.911, 1.294],
  [103.893, 1.291],
  [103.876, 1.288],
  [103.862, 1.281],
  [103.851, 1.269],
  [103.838, 1.263],
  [103.822, 1.264],
  [103.808, 1.27],
  [103.793, 1.277],
  [103.777, 1.281],
  [103.76, 1.285],
  [103.743, 1.288],
  [103.727, 1.291],
  [103.712, 1.297],
  [103.697, 1.303],
  [103.68, 1.307],
  [103.664, 1.311],
  [103.648, 1.313],
  [103.632, 1.318],
]

const PULAU_UBIN: Ring = [
  [103.945, 1.412],
  [103.965, 1.42],
  [103.985, 1.418],
  [104.0, 1.41],
  [103.99, 1.4],
  [103.97, 1.398],
  [103.952, 1.402],
]

const SENTOSA: Ring = [
  [103.806, 1.253],
  [103.822, 1.256],
  [103.835, 1.25],
  [103.845, 1.245],
  [103.833, 1.24],
  [103.818, 1.247],
]

const JURONG_ISLAND: Ring = [
  [103.66, 1.283],
  [103.686, 1.288],
  [103.71, 1.282],
  [103.723, 1.267],
  [103.706, 1.256],
  [103.68, 1.259],
  [103.662, 1.27],
]

const COASTLINE: ReadonlyArray<Ring> = [
  MAIN_ISLAND,
  PULAU_UBIN,
  SENTOSA,
  JURONG_ISLAND,
]

/**
 * Distance between neighbouring lattice centres, and the radius of one resting
 * dot, both in viewBox units.
 *
 * Taken from the reference the owner supplied (lassie.ai's locations section,
 * read live rather than off the video): a 1,008px-wide map on a 12.3px pitch
 * with 6px dots — a pitch of 1.22% of the map's width and a dot a quarter of
 * that pitch across. Scaled to this viewBox that is 12.6 and 3.07, and it puts
 * the lattice at ~2,100 dots against the reference's 2,259. The ratio is what
 * matters: a finer pitch with thinner dots reads as a grey wash rather than a
 * drawing made of dots.
 */
export const LATTICE_STEP = 12.6

export const LATTICE_DOT = 3.07

/** Clear space around the coastline so swollen edge dots never clip. */
const PADDING = 16

/** Width of the projected coastline, before padding. */
const PROJECTED_WIDTH = 1000

const allPoints = COASTLINE.flat()
const minLng = Math.min(...allPoints.map(([lng]) => lng))
const maxLng = Math.max(...allPoints.map(([lng]) => lng))
const minLat = Math.min(...allPoints.map(([, lat]) => lat))
const maxLat = Math.max(...allPoints.map(([, lat]) => lat))

/**
 * One scale for both axes. Over 0.4° of longitude at the equator the Mercator
 * stretch is under a thousandth of a degree, so an equirectangular projection
 * is exact enough for a drawing and keeps the aspect honest.
 */
const SCALE = PROJECTED_WIDTH / (maxLng - minLng)

const WIDTH = PROJECTED_WIDTH + PADDING * 2
const HEIGHT = (maxLat - minLat) * SCALE + PADDING * 2

function project([lng, lat]: Point): readonly [number, number] {
  return [
    PADDING + (lng - minLng) * SCALE,
    // Latitude grows north; the viewBox grows south.
    PADDING + (maxLat - lat) * SCALE,
  ]
}

const round = (value: number) => Math.round(value * 10) / 10

/** Ray casting, one ring at a time. The rings never overlap, so "in any" wins. */
function inside(
  x: number,
  y: number,
  ring: ReadonlyArray<readonly [number, number]>
) {
  let hit = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      hit = !hit
    }
  }
  return hit
}

const projectedRings = COASTLINE.map((ring) => ring.map(project))

type LatticeDot = { readonly x: number; readonly y: number }

/**
 * Every lattice centre that falls on land, in reading order. Centres sit at
 * `(col + 0.5) * step`, which is also where the SVG `<pattern>` puts its dot —
 * so the drawn lattice and this list are the same grid, and a mark placed on a
 * centre lands exactly on top of the dot it replaces.
 *
 * Not exported: the lattice itself ships as one pattern-filled path, so nothing
 * outside this module needs the list. `MARK_DOTS` is the part that gets drawn.
 */
const dots: ReadonlyArray<LatticeDot> = (() => {
  const found: Array<LatticeDot> = []
  const columns = Math.ceil(WIDTH / LATTICE_STEP)
  const rows = Math.ceil(HEIGHT / LATTICE_STEP)
  for (let row = 0; row < rows; row++) {
    const y = (row + 0.5) * LATTICE_STEP
    for (let column = 0; column < columns; column++) {
      const x = (column + 0.5) * LATTICE_STEP
      if (projectedRings.some((ring) => inside(x, y, ring))) {
        found.push({ x, y })
      }
    }
  }
  return found
})()

/**
 * The lattice's region: the accepted grid cells, merged into runs.
 *
 * The dots themselves are an SVG `<pattern>`, and a pattern is clipped by the
 * shape it fills — which is why filling the *coastline* was wrong. Every dot
 * along the coast came out a crescent and the island read as a masked
 * photograph of a grid rather than a drawing made of dots. The reference has no
 * partial dot anywhere: its coastline is *which dots exist*, not where a mask
 * cuts them.
 *
 * So the fill region is the union of the whole cells that passed the
 * point-in-polygon test. Each cell is exactly one pattern tile and the dot sits
 * at its centre with clearance on every side, so filling a cell shows one whole
 * dot and filling none of it shows nothing. Consecutive cells in a row merge
 * into a single rectangle, which takes the region from two thousand shapes to
 * about a hundred — a couple of kilobytes for the whole island.
 */
const latticeRegion = (() => {
  const runs: Array<string> = []
  const byRow = new Map<number, Array<number>>()
  for (const dot of dots) {
    const column = Math.round(dot.x / LATTICE_STEP - 0.5)
    const row = Math.round(dot.y / LATTICE_STEP - 0.5)
    const columns = byRow.get(row)
    if (columns) columns.push(column)
    else byRow.set(row, [column])
  }
  for (const [row, columns] of [...byRow.entries()].sort(
    (a, b) => a[0] - b[0]
  )) {
    columns.sort((a, b) => a - b)
    let start = columns[0]
    let previous = start
    const flush = (end: number) => {
      const x = round(start * LATTICE_STEP)
      const y = round(row * LATTICE_STEP)
      const width = round((end - start + 1) * LATTICE_STEP)
      const height = round(LATTICE_STEP)
      runs.push(`M${x} ${y}h${width}v${height}h-${width}z`)
    }
    for (let i = 1; i < columns.length; i++) {
      if (columns[i] === previous + 1) {
        previous = columns[i]
        continue
      }
      flush(previous)
      start = columns[i]
      previous = start
    }
    flush(previous)
    runs.push("")
  }
  return runs.join("")
})()

export const SG_MAP = {
  viewBox: `0 0 ${round(WIDTH)} ${round(HEIGHT)}`,
  width: round(WIDTH),
  height: round(HEIGHT),
  /** Aspect ratio, for sizing the map against the viewport in CSS. */
  aspect: Math.round((WIDTH / HEIGHT) * 1000) / 1000,
  latticeRegion,
} as const
