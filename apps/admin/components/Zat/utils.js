import { fontStyles } from '@project-r/styleguide'

import { css } from 'glamor'

export const styles = {
  info: css({
    borderBottom: '1px solid #DDD',
    paddingBottom: 5,
    marginBottom: 5,
    ...fontStyles.sansSerifRegular14,
  }),
  hint: css({
    borderBottom: '1px solid #DDD',
    paddingBottom: 10,
    marginBottom: 10,
    ...fontStyles.sansSerifRegular14,
  }),
  item: css({
    borderBottom: '1px solid #DDD',
    marginBottom: 5,
    paddingBottom: 5,
  }),
  part: css({
    marginTop: 10,
    marginBottom: 10,
  }),
  title: css({
    marginTop: '10px',
  }),
  mail: css({
    ...fontStyles.sansSerifRegular14,
    paddingTop: 5,
    paddingBottom: 5,
    '&:nth-child(odd)': {
      backgroundColor: 'var(--color-secondaryBg)',
    },
  }),
}
