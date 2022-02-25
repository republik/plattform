import React from 'react'
import compose from 'lodash/flowRight'

import {
  Interaction,
  RawHtml,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'

import { css } from 'glamor'

import withT from '../../lib/withT'

const styles = {
  cheatsheetH3: css({
    ...fontStyles.sansSerifMedium14,
    ...fontStyles.sansSerifMedium14,
    margin: '30px 0 8px',
  }),
  cheatsheetP: css({
    ...fontStyles.sansSerifRegular14,
    lineHeight: 1.2,
    paddingBottom: 15,
    [mediaQueries.mUp]: {
      paddingBottom: 40,
    },
  }),
}

const CheatSheet = compose(withT)(({ t }) => (
  <>
    <Interaction.H3 {...styles.cheatsheetH3}>
      {t('search/docs/title')}
    </Interaction.H3>
    <Interaction.P {...styles.cheatsheetP}>
      <RawHtml
        dangerouslySetInnerHTML={{
          __html: t('search/docs/text'),
        }}
      />
    </Interaction.P>
  </>
))

export default CheatSheet
