import * as colors from '../../theme/colors'
import {mUp} from '../../theme/mediaQueries'

export const link = {
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary
  },
  ':hover': {
    color: colors.primaryHover
  }
}

export const h1 = {
  color: colors.text,
  fontFamily: 'sans-serif',
  fontSize: 46,
  lineHeight: '60px'
}

export const h2 = {
  color: colors.text,
  fontFamily: 'sans-serif',
  fontSize: 30,
  lineHeight: '39px'
}

export const lead = {
  color: colors.text,
  fontFamily: 'Rubis-Regular, serif',
  fontSize: 26,
  lineHeight: '40px',
  [mUp]: {
    fontSize: 35,
    lineHeight: '43px',
  }
}

export const p = {
  color: colors.text,
  fontFamily: 'Rubis-Regular, serif',
  fontSize: 16,
  lineHeight: '25px',
  [mUp]: {
    fontSize: 26,
    lineHeight: '40px'
  }
}

export const quote = {
  color: colors.text,
  fontSize: 26,
  lineHeight: '40px',
  fontFamily: 'Rubis-Regular'
}
export const quoteText = {

}
