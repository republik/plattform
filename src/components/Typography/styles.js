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

// serifTitle
export const serifTitle58 = {
  fontFamily: fontFamilies.serifTitle,
  fontSize: 58,
  fontWeight: 'normal',
  lineHeight: '60px'
}
export const serifTitle30 = {
  fontFamily: fontFamilies.serifTitle,
  fontSize: 30,
  fontWeight: 'normal',
  lineHeight: '34px'
}
export const serifTitle22 = {
  fontFamily: fontFamilies.serifTitle,
  fontSize: 22,
  fontWeight: 'normal',
  lineHeight: '24px'
}
export const serifTitle20 = {
  fontFamily: fontFamilies.serifTitle,
  fontSize: 20,
  fontWeight: 'normal',
  lineHeight: '22px'
}

// serifRegular
export const serifRegular25 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 25,
  lineHeight: '33px'
}
export const serifRegular23 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 23,
  lineHeight: '30px'
}
export const serifRegular21 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 21,
  lineHeight: '32px'
}
export const serifRegular19 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 19,
  lineHeight: '24px'
}
export const serifRegular18 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 18,
  lineHeight: '24px'
}
export const serifRegular17 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 17,
  lineHeight: '28px'
}
export const serifRegular16 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 16,
  lineHeight: '24px'
}
export const serifRegular14 = {
  fontFamily: fontFamilies.serifRegular,
  fontSize: 14,
  lineHeight: '19px'
}

// serifBold
export const serifBold52 = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal',
  fontSize: 52,
  lineHeight: '56px',
  letterSpacing: -0.45
}
export const serifBold36 = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal',
  fontSize: 36,
  lineHeight: '38px',
  letterSpacing: -0.3
}
export const serifBold28 = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal',
  fontSize: 28,
  lineHeight: '33px'
}
export const serifBold24 = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal',
  fontSize: 24,
  lineHeight: '30px',
  letterSpacing: -0.21
}
export const serifBold19 = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal',
  fontSize: 19,
  lineHeight: '24px'
}
export const serifBold16 = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal',
  fontSize: 16,
  lineHeight: '24px'
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
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 21,
  lineHeight: '32px'
}
export const sansSerifRegular18 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 18,
  lineHeight: '30px',
}
export const sansSerifRegular16 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 16,
  lineHeight: '25px',
}
export const sansSerifRegular15 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 15,
  lineHeight: '24px'
}
export const sansSerifRegular14 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 14,
  lineHeight: '17px'
}
export const sansSerifRegular12 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 12,
  lineHeight: '12px'
}
export const sansSerifRegular11 = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 11,
  lineHeight: '12px'
}

// sansSerifMedium
export const sansSerifMedium58 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 58,
  fontWeight: 'normal',
  lineHeight: '60px'
}
export const sansSerifMedium40 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontWeight: 'normal',
  fontSize: 40,
  lineHeight: '46px',
  letterSpacing: -0.35,
}
export const sansSerifMedium30 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 30,
  lineHeight: '34px',
}
export const sansSerifMedium22 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontWeight: 'normal',
  fontSize: 22,
  lineHeight: '28px',
  letterSpacing: 'normal'
}
export const sansSerifMedium20 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontWeight: 'normal',
  fontSize: 20,
  lineHeight: '24px',
  letterSpacing: 'normal'
}
export const sansSerifMedium19 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 19,
  lineHeight: '30px',
}
export const sansSerifMedium16 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 16,
  lineHeight: '25px',
}
export const sansSerifMedium14 = {
  fontFamily: fontFamilies.sansSerifMedium,
  fontSize: 14,
  lineHeight: '17px',
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
export const quoteText = {}
