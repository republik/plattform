import colors from '../../theme/colors'
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

// serifRegular
export const serifRegular25 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 25,
  lineHeight: '33px'
}
export const serifRegular21 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 21,
  lineHeight: '32px'
}
export const serifRegular16 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 16,
  lineHeight: '25px'
}

// serifBold
export const serifBold52 = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal',
  fontSize: 52,
  lineHeight: '56px',
  letterSpacing: -0.45
}
export const serifBold24 = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal',
  fontSize: 24,
  lineHeight: '26px',
  letterSpacing: -0.21
}

// sansSerifRegular
export const sansSerifRegular30 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontWeight: 'normal',
  fontSize: 30,
  lineHeight: '35px',
  letterSpacing: -0.26,
}
export const sansSerifRegular21 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 21,
  lineHeight: '32px'
}
export const sansSerifRegular16 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 16,
  lineHeight: '25px',
}
export const sansSerifRegular14 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 14,
  lineHeight: '19px'
}

// sansSerifMedium
export const sansSerifMedium40 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontWeight: 'normal',
  fontSize: 40,
  lineHeight: '46px',
  letterSpacing: -0.35,
}
export const sansSerifMedium22 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontWeight: 'normal',
  fontSize: 22,
  lineHeight: '28px',
  letterSpacing: 'normal'
}

export const h1 = {
  ...serifBold52,
  color: colors.text,
  margin: '30px 0 20px 0',
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  }
}

export const h2 = {
  ...serifBold24,
  color: colors.text,
  margin: '30px 0 20px 0',
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  }
}

export const lead = {
  ...serifRegular25,
  color: colors.text,
  margin: '20px 0 20px 0'
}

export const p = {
  color: colors.text,
  ...serifRegular16,
  [mUp]: {
    ...serifRegular21,
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
  ...sansSerifRegular14,
  color: colors.secondary
}

export const quote = {
  ...sansSerifRegular21,
  color: colors.text,
}
export const quoteText = {

}

export const interactionH1 = {
  ...sansSerifMedium40,
  color: colors.text,
  margin: 0
}

export const interactionH2 = {
  ...sansSerifRegular30,
  color: colors.text,
  margin: 0
}

export const interactionH3 = {
  ...sansSerifMedium22,
  color: colors.text,
  margin: 0
}

export const interactionP = {
  color: colors.text,
  ...sansSerifRegular16,
  [mUp]: {
    ...sansSerifRegular21
  },
  margin: 0
}

