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
  fontFamily: fontFamilies.serifBold,
  fontSize: 52,
  lineHeight: '56px',
  letterSpacing: -0.45,
  margin: '30px 0 20px 0',
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  }
}

export const h2 = {
  color: colors.text,
  fontFamily: fontFamilies.serifBold,
  fontSize: 24,
  lineHeight: '26px',
  letterSpacing: -0.21,
  margin: '30px 0 20px 0',
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  }
}

export const lead = {
  color: colors.text,
  fontFamily: fontFamilies.serifRegular,
  fontSize: 25,
  lineHeight: '33px',
  margin: '20px 0 20px 0'
}

export const p = {
  color: colors.text,
  fontFamily: fontFamilies.serifRegular,
  fontSize: 16,
  lineHeight: '25px',
  [mUp]: {
    fontSize: 21,
    lineHeight: '32px'
  },
  margin: '20px 0 20px 0',
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
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

export const interactionH1 = {
  color: colors.text,
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 40,
  lineHeight: '46px',
  letterSpacing: -0.35,
  margin: 0
}

export const interactionH2 = {
  color: colors.text,
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 22,
  lineHeight: '28px',
  letterSpacing: 'normal',
  margin: 0
}

export const interactionP = {
  color: colors.text,
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 16,
  lineHeight: '25px',
  [mUp]: {
    fontSize: 21,
    lineHeight: '32px'
  },
  margin: 0
}

