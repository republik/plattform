import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'

const styles = {
  beta: css({
    display: 'inline-block',
    textTransform: 'uppercase',
    padding: '3px 9px',
    borderRadius: 3,
    fontSize: 15,
    lineHeight: '21px',
    height: 28,
    ...fontStyles.sansSerifMedium,
    color: '#fff',
    pointerEvents: 'none',
    backgroundColor: 'var(--color-secondary)',
  }),
}

export default ({ style }) => (
  <span {...styles.beta} style={style}>
    beta
  </span>
)
