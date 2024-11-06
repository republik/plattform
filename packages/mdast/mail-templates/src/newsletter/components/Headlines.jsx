import { fontFamilies } from '../../styleguide-clone/theme/fonts'

const h2Style = {
  fontFamily: fontFamilies.serifBold,
  fontSize: '23px',
  lineHeight: '130%',
  marginTop: '60px',
}

export const H2 = ({ children }) => <h2 style={h2Style}>{children}</h2>
