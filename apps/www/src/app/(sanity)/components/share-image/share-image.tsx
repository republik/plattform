/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from 'react'
import { GT_AMERICA, REPUBLIK_SERIF } from './fonts'

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

export type ThemeName = 'EDITORIAL' | 'META' | 'PAGE'
export type Layout = 'TEXT' | 'BACKGROUND_IMAGE' | 'LOGO'
export type TextPosition = 'top' | 'center' | 'bottom'

export type ShareImageProps = {
  text?: string | null
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
  const hasBackgroundImage = layout === 'BACKGROUND_IMAGE' && !!backgroundImageUrl
  const hasLogo = layout === 'LOGO' && !!logoUrl

  const color = accentColor || '#000000'
  const backgroundColor = inverted ? color : '#FFFFFF'
  const textColor = inverted ? '#FFFFFF' : '#000000'
  const headingColor = inverted ? '#FFFFFF' : color

  const cleanText = sanitize(text)
  const cleanHeading = sanitize(heading)
  const displayedText = cleanText !== '' ? cleanText : PLACEHOLDER_TEXT
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
            justifyContent: 'center',
            fontFamily,
            fontWeight,
            fontSize: fontSize || DEFAULT_FONT_SIZE,
            lineHeight: 1.25,
            width: blockWidth,
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
            color: textColor,
          }}
        >
          {displayedText}
        </div>
      </div>
    </div>
  )
}
