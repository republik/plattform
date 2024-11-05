import colors from '../../styleguide-clone/theme/colors'
import { paragraphStyle } from './Paragraph'

export const BlockQuoteParagraph = ({ children }) => (
  <p
    style={{
      ...paragraphStyle,
      margin: 0,
      padding: '10px 0',
    }}
  >
    {children}
  </p>
)

export const BlockQuoteNested = ({ children }) => (
  <div
    style={{
      backgroundColor: '#f7f7f7',
      borderLeft: `2px solid ${colors.divider}`,
      margin: '20px auto',
      padding: '20px 25px',
    }}
  >
    {children}
  </div>
)

const BlockQuote = ({ children }) => (
  <div
    style={{
      backgroundColor: '#f7f7f7',
      margin: '20px auto',
      padding: '20px 25px',
    }}
  >
    {children}
  </div>
)

export default BlockQuote
