import colors from '../../styleguide-clone/theme/colors'
import { fontStyles } from '../../styleguide-clone/theme/fonts'
import { editorialFontRule, interactionFontRule } from '../../styleguide-clone/components/Typography'

const baseParagraphStyle = {
  color: colors.text,
  fontSize: '19px',
  lineHeight: '30px',
  margin: '30px 0',
}

export const EditorialParagraph = ({ children }) => (
  <p
    className={editorialFontRule}
    style={{ ...baseParagraphStyle, ...fontStyles.serifRegular }}
  >
    {children}
  </p>
)

export const InteractionParagraph = ({ children }) => (
  <p
    className={interactionFontRule}
    style={{ ...baseParagraphStyle, ...fontStyles.sansSerifRegular }}
  >
    {children}
  </p>
)
