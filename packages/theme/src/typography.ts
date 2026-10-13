import { calculateClamp } from 'utopia-core'

/**
 * The reader's font size setting, as a unitless factor.
 *
 * `--reader-font-scale` is written to `:root` from the cookie (server) and
 * localStorage (client); the `editorialContent` recipe re-publishes it on its
 * root as `--article-font-scale`. Only declarations inside an editorial-content
 * root see it — everywhere else the `1` fallback applies, which is what keeps
 * the front-page teasers fixed even though they share the `editorial*` /
 * `meta*` text styles.
 *
 * A factor rather than an absolute size: `calc(1.0625rem * 1.2)` still respects
 * the browser's own font size setting, which overriding the root font size did
 * not.
 */
const READER_FONT_SCALE = 'var(--article-font-scale, 1)'

type FontSize = string

function calculateEditorialFluidFontSize(min: number, max: number): FontSize {
  return calculateClamp({
    minWidth: 480, // viewport width where we want to show the smallest font size
    maxWidth: 695, // max content width
    minSize: min,
    maxSize: max,
    relativeTo: 'viewport',
  })
}

/**
 * Font sizes of the editorial text styles — the single source shared by the
 * `textStyles` in `preset-republik.ts` (fixed, for anything outside an article)
 * and by the `editorialContent` recipe, which scales the same values with the
 * reader's font size setting. Keys are the text style names.
 */
export const editorialFontSizes = {
  editorialTitle: calculateEditorialFluidFontSize(30, 58),
  editorialLead: calculateEditorialFluidFontSize(19, 23),
  editorialByline: calculateEditorialFluidFontSize(14, 15),
  editorialHeading: calculateEditorialFluidFontSize(16, 20),
  editorialParagraph: calculateEditorialFluidFontSize(17, 19),
  editorialSubheading: calculateEditorialFluidFontSize(19, 24),
  metaTitle: calculateEditorialFluidFontSize(30, 58),
  metaSubheading: calculateEditorialFluidFontSize(19, 24),
  metaParagraph: calculateEditorialFluidFontSize(17, 19),
} satisfies Record<string, FontSize>

/** Scales a font size with the reader's setting. */
const readerScaled = (fontSize: string) =>
  `calc(${fontSize} * ${READER_FONT_SCALE})`

/**
 * A font size that follows the reader's setting at both breakpoints. Returns the
 * `md` condition too, so spread it into a style object.
 */
export const readerScaledFontSize = (fs: FontSize) => ({
  fontSize: readerScaled(fs),
})
