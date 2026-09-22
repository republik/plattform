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
export const READER_FONT_SCALE = 'var(--article-font-scale, 1)'

type FontSize = { base: string; md: string }

/**
 * Font sizes of the editorial text styles — the single source shared by the
 * `textStyles` in `preset-republik.ts` (fixed, for anything outside an article)
 * and by the `editorialContent` recipe, which scales the same values with the
 * reader's font size setting. Keys are the text style names.
 */
export const editorialFontSizes = {
  editorialTitle: { base: '1.875rem', md: '3.625rem' },
  editorialLead: { base: '1.1875rem', md: '1.4375rem' },
  editorialByline: { base: '0.875rem', md: '0.9375rem' },
  editorialHeading: { base: '1rem', md: '1.25rem' },
  editorialParagraph: { base: '1.0625rem', md: '1.1875rem' },
  editorialSubheading: { base: '1.1875rem', md: '1.5rem' },
  metaTitle: { base: '1.875rem', md: '3.625rem' },
  metaSubheading: { base: '1.1875rem', md: '1.5rem' },
  metaParagraph: { base: '1.0625rem', md: '1.1875rem' },
} satisfies Record<string, FontSize>

/** Scales a font size with the reader's setting. */
export const readerScaled = (fontSize: string) =>
  `calc(${fontSize} * ${READER_FONT_SCALE})`

/**
 * A font size that follows the reader's setting at both breakpoints. Returns the
 * `md` condition too, so spread it into a style object.
 */
export const readerScaledFontSize = ({ base, md }: FontSize) => ({
  fontSize: readerScaled(base),
  md: { fontSize: readerScaled(md) },
})
