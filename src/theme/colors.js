import {getJson} from './env'

const colors = {
  primary: '#00508C',
  primaryBg: '#BFE1FF',
  secondary: '#00335A',
  secondaryBg: '#D8EEFF',
  disabled: '#B8BDC1',
  text: '#191919',
  lightText: '#979797',
  error: '#9E0041',
  divider: '#DBDCDD',
  online: '#00DC00',
  editorial: '#00B4FF',
  meta: '#64966E',
  social: '#E9A733',
  ...getJson('COLORS')
}

export const colorForKind = kind => {
  if (kind && kind.match(/social/i)) {
    return colors.social
  }
  return colors[kind]
}

export default colors
