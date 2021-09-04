import { fontStyles, colors } from '@project-r/styleguide'

import { css } from 'glamor'

export const styles = {
  hint: css({
    borderBottom: '1px solid #DDD',
    marginBottom: '10px',
    paddingBottom: '10px',
    ...fontStyles.sansSerifRegular14
  }),
  item: css({
    borderBottom: '1px solid #DDD',
    marginBottom: '10px',
    paddingBottom: '10px'
  }),
  title: css({
    marginTop: '10px'
  }),
  mail: css({
    ...fontStyles.sansSerifRegular14,
    paddingTop: 5,
    paddingBottom: 5,
    '&:nth-child(odd)': {
      backgroundColor: colors.secondaryBg
    }
  })
}
