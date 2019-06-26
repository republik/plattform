import SG, {getJson} from './env'

export const fontFamilies = {
  serifTitle: 'Georgia, serif',
  serifRegular: 'Georgia, serif',
  serifItalic: 'Georgia, serif',
  serifBold: 'Georgia, serif',
  serifBoldItalic: 'Georgia, serif',
  sansSerifRegular: 'Helvetica Neue, Helvetica, sans-serif',
  sansSerifItalic: 'Helvetica Neue, Helvetica, sans-serif',
  sansSerifMedium: 'Helvetica Neue, Helvetica, sans-serif',
  monospaceRegular: 'Menlo, Courier, monospace',
  cursiveTitle: 'sans-serif',
  ...getJson('FONT_FAMILIES')
}

export const fontStyles = {
  serifTitle: {
    fontFamily: fontFamilies.serifTitle,
    fontWeight: 900
  },
  serifRegular: {
    fontFamily: fontFamilies.serifRegular
  },
  serifItalic: {
    fontFamily: fontFamilies.serifItalic,
    fontStyle: 'italic'
  },
  serifBold: {
    fontFamily: fontFamilies.serifBold,
    fontWeight: 700
  },
  serifBoldItalic: {
    fontFamily: fontFamilies.serifBoldItalic,
    fontWeight: 700,
    fontStyle: 'italic'
  },
  sansSerifRegular: {
    fontFamily: fontFamilies.sansSerifRegular
  },
  sansSerifItalic: {
    fontFamily: fontFamilies.sansSerifItalic,
    fontStyle: 'italic'
  },
  sansSerifMedium: {
    fontFamily: fontFamilies.sansSerifMedium,
    fontWeight: 500
  },
  monospaceRegular: {
    fontFamily: fontFamilies.monospaceRegular
  },
  cursiveTitle: {
    fontFamily: fontFamilies.cursiveTitle,
    fontWeight: 500,
    fontStyle: 'italic'
  },
  ...getJson('FONT_STYLES')
}

export const fontFaces = () => SG.FONT_FACES || ''
