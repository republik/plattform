import { css } from 'glamor'
import withT from '../../../lib/withT'
import {
  IconButton,
} from '@project-r/styleguide'
import PropTypes from 'prop-types'
import { IconEtiquette, IconFormatColorText } from '@republik/icons'

const styles = {
  container: css({
    display: 'flex',
  }),
}

const SecondaryActions = ({ t, isReply = false }) => (
  <div {...styles.container}>
    <IconButton
      Icon={IconFormatColorText}
      href='/markdown'
      target='_blank'
      title={t('components/Discussion/markdown/title')}
    />
    {isReply && (
      <IconButton
        size={20}
        Icon={IconEtiquette}
        href='/etikette'
        target='_blank'
        title={t('components/Discussion/etiquette')}
      />
    )}
  </div>
)

SecondaryActions.propTypes = {
  t: PropTypes.func.isRequired,
  isReply: PropTypes.bool,
}

export default withT(SecondaryActions)
