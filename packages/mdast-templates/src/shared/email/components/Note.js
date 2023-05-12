import React from 'react'
import { Interaction } from '@project-r/styleguide/src/components/Typography'
import colors from '@project-r/styleguide/src/theme/colors'
import { fontStyles } from '@project-r/styleguide/src/theme/fonts'

export const Note = ({ children }) => <>{children}</>

export const NoteParagraph = ({ children, attributes, ...props }) => (
  <p
    className={Interaction.fontRule}
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
