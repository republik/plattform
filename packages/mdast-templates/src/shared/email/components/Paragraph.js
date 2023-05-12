import React from 'react'
import colors from '@project-r/styleguide/src/theme/colors'
import { fontStyles } from '@project-r/styleguide/src/theme/fonts'
import {
  Editorial,
  Interaction,
} from '@project-r/styleguide/src/components/Typography'

const baseParagraphStyle = {
  color: colors.text,
  fontSize: '19px',
  lineHeight: '30px',
  margin: '30px 0',
}

export const EditorialParagraph = ({ children }) => (
  <p
    className={Editorial.fontRule}
    style={{ ...baseParagraphStyle, ...fontStyles.serifRegular }}
  >
    {children}
  </p>
)

export const InteractionParagraph = ({ children }) => (
  <p
    className={Interaction.fontRule}
    style={{ ...baseParagraphStyle, ...fontStyles.sansSerifRegular }}
  >
    {children}
  </p>
)
