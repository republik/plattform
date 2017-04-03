import * as colors from '../../theme/colors'
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
  fontFamily: 'sans-serif',
  fontSize: 52,
  lineHeight: '56px',
  margin: '0 0 20px 0'
}

export const h2 = {
  color: colors.text,
  fontFamily: 'sans-serif',
  fontSize: 24,
  lineHeight: '26px',
  margin: '0 0 20px 0'
}

export const lead = {
  color: colors.text,
  fontFamily: 'Rubis-Regular, serif',
  fontSize: 25,
  lineHeight: '33px',
  margin: '0 0 20px 0'
}

export const p = {
  color: colors.text,
  fontFamily: 'Rubis-Regular, serif',
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
  fontFamily: 'sans-serif',
  color: colors.secondary
}

export const quote = {
  color: colors.text,
  fontSize: 21,
  lineHeight: '32px',
  fontFamily: 'Rubis-Regular, serif'
}
export const quoteText = {

}
