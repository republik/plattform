/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from 'react'
import { GT_AMERICA, REPUBLIK_SERIF } from './fonts'

// text is Portable Text (textOnlyEditor: bold/italic/superscript/subscript
// only, no annotations) — one block per line. Kept minimal/local rather
// than importing a PortableTextBlock type, since only span text + marks
// are ever read here.
export type TextSpan = { text?: string; marks?: string[] }
export type TextBlockLine = { children?: TextSpan[] }

export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 630
export const SHARE_IMAGE_PADDING = 48

// Mirrors SHARE_IMAGE_DEFAULTS in the styleguide's ShareImagePreview.js
const DEFAULT_FONT_SIZE = 56
const DEFAULT_TEXT_POSITION: TextPosition = 'bottom'
const HEADING_FONT_SIZE = 44
const LOGO_HEIGHT = 260
const PLACEHOLDER_TEXT = 'Text für Sharebild'

// Soft hyphens (U+00AD) are hyphenation hints that stay invisible in a browser
// but Satori renders them as visible hyphens. Strip them so the generated image
// matches the on-site look.
const SOFT_HYPHEN = /­/g
function sanitize(value?: string | null): string {
  return (value || '').replace(SOFT_HYPHEN, '')
}

function sanitizeLines(blocks?: TextBlockLine[] | null): TextBlockLine[] {
  // Guards against legacy documents whose imageBuilder.text is still a plain
  // string (pre-dating the Portable Text migration) — .map would throw.
  if (!Array.isArray(blocks)) return []
  return blocks.map((block) => ({
    children: (block.children ?? []).map((span) => ({
      ...span,
      text: sanitize(span.text),
    })),
  }))
}

function linesHaveText(blocks: TextBlockLine[]): boolean {
  return blocks.some((block) =>
    (block.children ?? []).some((span) => span.text !== ''),
  )
}

// Renders one span with its marks — bold/italic map straight to CSS;
// superscript/subscript nest a smaller, baseline-shifted span (the same
// technique <sup>/<sub> use under the hood). Satori recognizes
// `verticalAlign` as a property name (it appears once, in a list of known
// style keys) but has no actual handling for it anywhere — every keyword
// is a no-op — so the shift is done by hand with position:relative + top,
// which satori does apply.
//
// `top: Nem` resolves against the span's OWN font-size (0.65em of the
// surrounding text), not the surrounding text's — so a value tuned by eye
// against the *outer* size (-0.1em up for sup, 0.5em down for sub) is
// divided by 0.65 here to land at the intended offset once it resolves
// against the smaller inner size.
const SUP_TOP = `${-0.1 / 0.65}em`
const SUB_TOP = `${0.5 / 0.65}em`

// Satori trims a leading/trailing space from a span's own text content
// regardless of the parent's layout mode — confirmed by rendering " test"
// and "test" in isolation and getting an identical width. That silently
// drops the space PT stores at a mark boundary (e.g. "CO" + "2"(sup) +
// " test" as three spans) unless whiteSpace turns that trimming off.
// pre-wrap (not pre) — pre also disables wrapping within the span, which
// would break a long plain-text run that needs to wrap across lines.
const PRESERVE_WHITESPACE = { whiteSpace: 'pre-wrap' as const }

function TextSpanEl({ span }: { span: TextSpan }) {
  const marks = span.marks ?? []
  let node: ReactElement | string = span.text ?? ''
  if (marks.includes('sup')) {
    node = (
      <span style={{ fontSize: '0.65em', position: 'relative', top: SUP_TOP, ...PRESERVE_WHITESPACE }}>
        {node}
      </span>
    )
  }
  if (marks.includes('sub')) {
    node = (
      <span style={{ fontSize: '0.65em', position: 'relative', top: SUB_TOP, ...PRESERVE_WHITESPACE }}>
        {node}
      </span>
    )
  }
  // Satori (unlike a real DOM) throws on an explicit `undefined` style
  // value, so only set fontWeight/fontStyle when a mark actually calls for
  // one, rather than always setting a key with a possibly-undefined value.
  const style: { fontWeight?: number; fontStyle?: 'italic'; whiteSpace: 'pre-wrap' } = {
    ...PRESERVE_WHITESPACE,
  }
  if (marks.includes('strong')) style.fontWeight = 700
  if (marks.includes('em')) style.fontStyle = 'italic'
  return <span style={style}>{node}</span>
}

export type ThemeName = 'EDITORIAL' | 'META' | 'PAGE'
export type Layout = 'TEXT' | 'BACKGROUND_IMAGE' | 'LOGO'
export type TextPosition = 'top' | 'center' | 'bottom'

export type ShareImageProps = {
  text?: TextBlockLine[] | null
  fontSize?: number | null
  textPosition?: TextPosition | null
  inverted?: boolean | null
  layout?: Layout | null
  themeName?: ThemeName | null
  accentColor?: string | null
  heading?: string | null
  backgroundImageUrl?: string | null
  logoUrl?: string | null
}

// EDITORIAL → serif title (RepublikSerif 900); META/PAGE → sans serif (GT America).
// Mirrors formatFonts in ShareImagePreview.js (editorial → serifTitle,
// meta → sansSerifRegular).
function mainFont(themeName?: ThemeName | null): {
  fontFamily: string
  fontWeight: number
} {
  if (themeName === 'META' || themeName === 'PAGE') {
    return { fontFamily: GT_AMERICA, fontWeight: 400 }
  }
  return { fontFamily: REPUBLIK_SERIF, fontWeight: 900 }
}

// Main axis (vertical) justification when a background image is present.
const backgroundJustify: Record<TextPosition, string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
}

export function ShareImage({
  text,
  fontSize,
  textPosition,
  inverted,
  layout,
  themeName,
  accentColor,
  heading,
  backgroundImageUrl,
  logoUrl,
}: ShareImageProps): ReactElement {
  const hasBackgroundImage =
    layout === 'BACKGROUND_IMAGE' && !!backgroundImageUrl
  const hasLogo = layout === 'LOGO' && !!logoUrl

  const color = accentColor || '#000000'
  const backgroundColor = inverted ? color : '#FFFFFF'
  const textColor = inverted ? '#FFFFFF' : '#000000'
  const headingColor = inverted ? '#FFFFFF' : color

  const cleanLines = sanitizeLines(text)
  const cleanHeading = sanitize(heading)
  const hasText = linesHaveText(cleanLines)
  const blockWidth = hasBackgroundImage ? '80%' : '100%'

  const justifyContent = hasBackgroundImage
    ? backgroundJustify[textPosition || DEFAULT_TEXT_POSITION]
    : 'center'

  const { fontFamily, fontWeight } = mainFont(themeName)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: SHARE_IMAGE_WIDTH,
        height: SHARE_IMAGE_HEIGHT,
      }}
    >
      {hasBackgroundImage && (
        <img
          src={backgroundImageUrl as string}
          width={SHARE_IMAGE_WIDTH}
          height={SHARE_IMAGE_HEIGHT}
          alt=''
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: SHARE_IMAGE_WIDTH,
            height: SHARE_IMAGE_HEIGHT,
            objectFit: 'cover',
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: SHARE_IMAGE_PADDING,
          alignItems: hasBackgroundImage ? 'flex-end' : 'center',
          justifyContent,
          // A background image covers the fill; without one we paint the solid
          // background (white, or the accent colour when inverted).
          backgroundColor: hasBackgroundImage ? 'transparent' : backgroundColor,
          overflow: 'hidden',
        }}
      >
        {hasLogo && (
          <img
            src={logoUrl as string}
            alt=''
            style={{ height: LOGO_HEIGHT, objectFit: 'contain' }}
          />
        )}
        {cleanHeading !== '' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              fontFamily: GT_AMERICA,
              fontWeight: 500,
              fontSize: HEADING_FONT_SIZE,
              marginBottom: 18,
              width: blockWidth,
              textAlign: 'center',
              color: headingColor,
            }}
          >
            {cleanHeading}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily,
            fontWeight,
            fontSize: fontSize || DEFAULT_FONT_SIZE,
            lineHeight: 1.25,
            width: blockWidth,
            textAlign: 'center',
            color: textColor,
          }}
        >
          {hasText
            ? cleanLines.map((block, i) => (
                // flex row (not display:contents) — contents made each span
                // its own item directly inside the column-flex ancestor
                // above, stacking every mark switch onto its own vertical
                // row instead of flowing as one line. Row + wrap keeps a PT
                // block's spans on one flowing, wrapping line; justifyContent
                // centers it the way textAlign would on a real block.
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  {(block.children ?? []).map((span, j) => (
                    <TextSpanEl key={j} span={span} />
                  ))}
                </div>
              ))
            : PLACEHOLDER_TEXT}
        </div>
      </div>
    </div>
  )
}
