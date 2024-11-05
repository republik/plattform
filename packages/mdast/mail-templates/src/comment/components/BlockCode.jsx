import { fontFamilies } from '../../styleguide-clone/theme/fonts'

 const BlockCode = ({ children }) => (
  <pre style={{ margin: '20px auto', whiteSpace: 'pre-wrap' }}>
    <code
      style={{
        backgroundColor: '#f7f7f7',
        display: 'block',
        fontFamily: fontFamilies.monospaceRegular,
        fontSize: '14px',
        margin: 0,
        padding: '20px 15px 20px 15px',
      }}
    >
      {children}
    </code>
  </pre>
)

export default BlockCode
