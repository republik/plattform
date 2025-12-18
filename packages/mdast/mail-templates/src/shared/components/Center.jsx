import { Mso } from '@republik/mdast-react-render/email'
import { fontFamilies } from '../../styleguide-clone/theme/fonts'

const Center = ({ children }) => {
  return (
    <tr>
      <td align='center' valign='top'>
        <table
          align='center'
          border='0'
          cellPadding='0'
          cellSpacing='0'
          width='100%'
          style={{
            maxWidth: 600,
            color: '#000',
            fontSize: 19,
            fontFamily: fontFamilies.serifRegular,
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: 20 }} className='body_content'>
                {children}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

export default Center
