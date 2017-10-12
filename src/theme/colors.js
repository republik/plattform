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
  ocker: '#B98C6C',
  green: '#00DC00',
  whiteSmoke: '#F8F8F8',
  ...getJson('COLORS')
}

export default colors
