import * as colors from '../../theme/colors'
import {fontFamilies} from '../../theme/fonts'
import {mUp} from '../../theme/mediaQueries'

export const link = {
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary
  },
  ':hover': {
    color: colors.secondary
  }
}

export const h1 = {
  color: colors.text,
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 52,
  lineHeight: '56px',
  margin: '0 0 20px 0'
}

export const h2 = {
  color: colors.text,
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 24,
  lineHeight: '26px',
  margin: '0 0 20px 0'
}

export const lead = {
  color: colors.text,
  fontFamily: fontFamilies.serifRegular,
  fontSize: 25,
  lineHeight: '33px',
  margin: '0 0 20px 0'
}

export const p = {
  color: colors.text,
  fontFamily: fontFamilies.serifRegular,
  fontSize: 16,
  lineHeight: '25px',
  margin: '0 0 20px 0',
  [mUp]: {
    fontSize: 21,
    lineHeight: '32px'
  }
}

export const label = {
  fontSize: 14,
  lineHeight: '19px',
  fontFamily: fontFamilies.sansSerifRegular,
  color: colors.secondary
}

export const quote = {
  color: colors.text,
  fontSize: 21,
  lineHeight: '32px',
  fontFamily: fontFamilies.serifRegular
}
export const quoteText = {

}
