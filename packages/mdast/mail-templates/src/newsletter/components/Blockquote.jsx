import { fontFamilies } from '../../styleguide-clone/theme/fonts'

const blockquoteStyle = {
  marginBottom: '30px',
}

const textStyle = {
  color: '#000',
  fontSize: '28px',
  lineHeight: '33px',
  fontFamily: fontFamilies.serifBold,
}

const sourceStyle = {
  color: '#000',
  fontSize: '15px',
  lineHeight: '158%',
  fontFamily: fontFamilies.sansSerifRegular,
  fontStyle: 'normal',
}

const Blockquote = ({ children }) => (
  <blockquote style={blockquoteStyle}>{children}</blockquote>
)

export const BlockquoteText = ({ children }) => (
  <p style={textStyle}>{children}</p>
)

export const BlockquoteSource = ({ children }) => (
  <cite style={sourceStyle}>{children}</cite>
)

export default Blockquote
