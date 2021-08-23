import React from 'react'
import colors from '../../../../theme/colors'
import { fontFamilies } from '../../../../theme/fonts'
import { Editorial, Interaction } from '../../../../components/Typography'

const baseParagraphStyle = {
  color: colors.text,
  fontSize: '19px',
  lineHeight: '158%'
}

export const EditorialParagraph = ({ children }) => (
  <p
    className={Editorial.fontRule}
    style={{ ...baseParagraphStyle, fontFamily: fontFamilies.serifRegular }}
  >
    {children}
  </p>
)

export const InteractionParagraph = ({ children }) => (
  <p
    className={Interaction.fontRule}
    style={{ ...baseParagraphStyle, fontFamily: fontFamilies.sansSerifRegular }}
  >
    {children}
  </p>
)
