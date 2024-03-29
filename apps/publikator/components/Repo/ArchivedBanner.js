import compose from 'lodash/flowRight'
import { css } from 'glamor'

import withT from '../../lib/withT'

import { Interaction, colors } from '@project-r/styleguide'

const styles = {
  container: css({
    backgroundColor: colors.social,
    padding: '12px 24px',
    marginBottom: '12px',
    width: '100%',
  }),
  notice: css({
    color: 'white',
  }),
}

const RepoArchivedBanner = ({ t, isTemplate, style }) => {
  return (
    <div {...styles.container} style={style}>
      <Interaction.H3 {...styles.notice}>
        {t(`repo/archived${isTemplate ? '/template/' : '/'}notice`)}
      </Interaction.H3>
    </div>
  )
}

export default compose(withT)(RepoArchivedBanner)
