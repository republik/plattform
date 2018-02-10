import SG, {getJson} from './env'

export const fontFamilies = {
  serifTitle: 'Georgia-Bold, serif',
  serifRegular: 'Georgia, serif',
  serifItalic: 'Georgia-Italic, serif',
  serifBold: 'Georgia-Bold, serif',
  sansSerifRegular: 'Helvetica-Neue-Regular, Helvetica Neue, Helvetica, sans-serif',
  sansSerifItalic: 'Helvetica-Neue-Italic, Helvetica Neue, Helvetica, sans-serif',
  sansSerifMedium: 'Helvetica-Neue-Medium, Helvetica-Bold, sans-serif',
  ...getJson('FONT_FAMILIES')
}

export const fontFaces = () => SG.FONT_FACES || ''
