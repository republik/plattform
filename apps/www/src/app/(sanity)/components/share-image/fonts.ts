// Font buffers for the `next/og` share-image generator.
//
// Satori (used by `next/og`) does not read CSS `@font-face`/font stacks — it
// needs the raw font data passed to `ImageResponse`. It also cannot decode
// `.woff2`, so we fetch the `.woff` variants from the CDN.
//
// Family names here must match the `fontFamily` values used in `share-image.tsx`.

const FONT_CDN = 'https://cdn.repub.ch/s3/republik-assets/fonts'

export const REPUBLIK_SERIF = 'RepublikSerif'
export const GT_AMERICA = 'GT America Standard'

type FontWeight = 400 | 500 | 700 | 900

type FontDef = {
  name: string
  url: string
  weight: FontWeight
  style: 'normal' | 'italic'
}

// serifTitle (EDITORIAL main text), sansSerifRegular (META/PAGE main text),
// sansSerifMedium (heading/Spitzmarke label).
const FONT_DEFS: FontDef[] = [
  {
    name: REPUBLIK_SERIF,
    url: `${FONT_CDN}/republik-serif-black-1013b.woff`,
    weight: 900,
    style: 'normal',
  },
  {
    name: GT_AMERICA,
    url: `${FONT_CDN}/gt-america-standard-regular.woff`,
    weight: 400,
    style: 'normal',
  },
  {
    name: GT_AMERICA,
    url: `${FONT_CDN}/gt-america-standard-medium.woff`,
    weight: 500,
    style: 'normal',
  },
]

export type LoadedFont = {
  name: string
  data: ArrayBuffer
  weight: FontWeight
  style: 'normal' | 'italic'
}

// Cache the fetched buffers on the module scope so warm serverless/edge
// instances reuse them across requests.
let cache: Promise<LoadedFont[]> | null = null

export function loadShareImageFonts(): Promise<LoadedFont[]> {
  if (!cache) {
    cache = Promise.all(
      FONT_DEFS.map(async (font) => {
        const res = await fetch(font.url)
        if (!res.ok) {
          throw new Error(
            `Failed to load font ${font.name} (${font.url}): ${res.status}`,
          )
        }
        return {
          name: font.name,
          data: await res.arrayBuffer(),
          weight: font.weight,
          style: font.style,
        }
      }),
    ).catch((err) => {
      // Don't cache a rejected promise — allow the next request to retry.
      cache = null
      throw err
    })
  }
  return cache
}
