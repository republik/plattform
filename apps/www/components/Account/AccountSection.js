import { css } from 'glamor'
import { mediaQueries, Interaction } from '@project-r/styleguide'
import { HEADER_HEIGHT } from '../constants'

const styles = {
  container: css({
    marginBottom: 36,
    [mediaQueries.mUp]: {
      marginBottom: 48,
    },
  }),
  title: css({
    position: 'relative',
    marginBottom: 12,
    [mediaQueries.mUp]: {
      marginBottom: 16,
    },
  }),
  accountAnchor: css({
    display: 'block',
    position: 'absolute',
    top: -(HEADER_HEIGHT + 20),
  }),
}

const AccountSection = ({ children, id, title }) => {
  return (
    <div {...styles.container}>
      <div {...styles.title}>
        <Interaction.H3>
          <a {...styles.accountAnchor} id={id} />
          {title}
        </Interaction.H3>
      </div>
      {children}
    </div>
  )
}

export default AccountSection
