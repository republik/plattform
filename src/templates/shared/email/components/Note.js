import React from 'react'
import { Interaction } from '../../../../components/Typography'
import colors from '../../../../theme/colors'
import { fontFamilies } from '../../../../theme/fonts'

export const Note = ({ children }) => <>{children}</>

export const NoteParagraph = ({ children, attributes, ...props }) => (
  <p
    className={Interaction.fontRule}
    style={{
      color: colors.text,
      fontSize: '15px',
      lineHeight: '21px', // 1.3125rem
      fontFamily: fontFamilies.sansSerifRegular
    }}
    {...attributes}
    {...props}
  >
    {children}
  </p>
)

export default NoteParagraph
