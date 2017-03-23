import * as colors from '../../theme/colors'

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
  fontSize: 98,
  lineHeight: '110px'
}

export const h2 = {
  color: colors.text,
  fontSize: 28,
  lineHeight: '36px'
}

export const lead = {
  color: colors.text,
  fontSize: 20,
  lineHeight: '30px',
  fontFamily: 'Rubis-Regular',
  fontWeight: 'bold'
}

export const p = {
  color: colors.text,
  fontSize: 18,
  lineHeight: '28px',
  fontFamily: 'Rubis-Regular'
}

export const quote = {
  color: colors.text,
  fontSize: 18,
  lineHeight: '30px',
  fontFamily: 'Rubis-Regular'
}
export const quoteText = {
  color: colors.active
}
