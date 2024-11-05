import { interactionFontRule } from '../../styleguide-clone/components/Typography'
import colors from '../../styleguide-clone/theme/colors'
import { fontStyles } from '../../styleguide-clone/theme/fonts'

export const Note = ({ children }) => <>{children}</>

export const NoteParagraph = ({ children, attributes, ...props }) => (
  <p
    className={interactionFontRule}
    style={{
      color: colors.text,
      ...fontStyles.sansSerifRegular,
      fontSize: '15px',
      lineHeight: '21px', // 1.3125rem
      margin: '30px 0',
    }}
    {...attributes}
    {...props}
  >
    {children}
  </p>
)

export default NoteParagraph
