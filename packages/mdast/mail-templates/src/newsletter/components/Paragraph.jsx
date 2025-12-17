import { fontFamilies } from '../../styleguide-clone/theme/fonts'
import { editorialFontRule } from '../../styleguide-clone/components/Typography'
import colors from '../../styleguide-clone/theme/colors'

export const paragraphStyle = {
  color: colors.text,
  fontSize: '19px',
  lineHeight: '158%',
  fontFamily: fontFamilies.serifRegular,
}

export const linkStyle = {
  color: colors.text,
  textDecoration: 'underline',
}

export const Br = () => <br />
export const A = ({ children, href, title }) => (
  <a href={href} title={title} style={linkStyle}>
    {children}
  </a>
)

// emails normally don't do glamor but
// Editorial.fontRule is manually injected in ./Container
const Paragraph = ({ children }) => (
  <p style={paragraphStyle} className={editorialFontRule}>
    {children}
  </p>
)

export default Paragraph
