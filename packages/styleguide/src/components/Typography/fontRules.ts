import { css } from 'glamor'
import { fontStyles } from '../../theme/fonts'
import colors from '../../theme/colors'

export const editorialFontRule = css({
  ...fontStyles.serifRegular,
  '& em, & i': fontStyles.serifItalic,
  '& strong, & b': fontStyles.serifBold,
  '& strong em, & em strong, & b i, & i b': fontStyles.serifBoldItalic,
})

export const interactionFontRule = css({
  ...fontStyles.sansSerifRegular,
  '& em, & i': fontStyles.sansSerifItalic,
  '& strong, & b': fontStyles.sansSerifMedium,
  '& strong em, & em strong, & b i, & i b': {
    textDecoration: `underline wavy ${colors.error}`,
  },
})
