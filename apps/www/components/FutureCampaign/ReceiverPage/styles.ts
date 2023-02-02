import { css } from 'glamor'
import { fontStyles, mediaQueries } from '@project-r/styleguide'

export const text = css({
  ...fontStyles.sansSerifRegular,
  margin: 0,
  fontSize: 17,
  lineHeight: '1.4em',
  [mediaQueries.mUp]: {
    fontSize: 21,
  },
})

export const textBold = css({
  ...fontStyles.sansSerifBold,
  margin: 0,
  fontSize: 17,
  lineHeight: '1.4em',
  [mediaQueries.mUp]: {
    fontSize: 21,
  },
})
