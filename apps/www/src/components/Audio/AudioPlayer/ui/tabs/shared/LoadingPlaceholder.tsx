import { css } from 'glamor'
import { Spinner } from '@project-r/styleguide'

const styles = {
  root: css({
    flex: '1 1 auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '10px 40px',
    minHeight: 100,
  }),
}

const LoadingPlaceholder = () => (
  <div {...styles.root}>
    <Spinner size={32} />
  </div>
)

export default LoadingPlaceholder
