import { fontFamilies } from '../../styleguide-clone/theme/fonts'
import { imageResizeUrl } from '@republik/mdast-react-render'

export const Image = ({ src, alt, plain }) => (
  <img
    key='image'
    style={{
      border: '0px',
      borderTop: plain ? undefined : '1px solid #555',
      paddingTop: plain ? undefined : '13px',
      width: '640px',
      height: 'auto',
      margin: '0px',
      maxWidth: '100% !important',
    }}
    width='600'
    src={imageResizeUrl(src, '600x')}
    alt={alt}
  />
)

export const Caption = ({ children }) => (
  <p
    key='caption'
    style={{
      fontSize: '15px',
      fontFamily: fontFamilies.sansSerifRegular,
      marginTop: '5px',
      marginBottom: '30px',
      textAlign: 'left',
    }}
  >
    {children}
  </p>
)

export const Byline = ({ children }) => (
  <span
    key='caption'
    style={{
      fontSize: '12px',
      fontFamily: fontFamilies.sansSerifRegular,
    }}
  >
    {children}
  </span>
)

const Figure = ({ children }) => <span>{children}</span>

export default Figure
