import PropTypes from 'prop-types'
import { css } from 'glamor'
import datetime from './datetime'

import withT from '../../../lib/withT'
import { swissNumbers } from '../../../lib/utils/format'

import sharedStyles from '../../sharedStyles'
import { AudioContext } from '../../Audio'

import {
  zIndex,
  ProgressCircle,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import { IconArrowDownward, IconClose } from '@republik/icons'

const RADIUS = 16
const formatPercent = swissNumbers.format('.0%')
const BUTTON_ICON_SIZE = 20
const ALERT_HEIGHT = 68
const PADDING = 16

const RestoreButton = ({ t, onClick, onClose, opacity, userProgress }) => {
  const [colorScheme] = useColorContext()
  const title = t('progress/restore/title', {
    percent: formatPercent(userProgress.percentage),
  })

  return (
    <AudioContext.Consumer>
      {(value) => (
        <div
          {...styles.container}
          {...colorScheme.set('color', 'text')}
          style={{ opacity, bottom: value.audioPlayerVisible ? 130 : 44 }}
          onClick={onClick}
        >
          <div {...styles.buttonBox}>
            <div {...styles.buttonBoxContent}>
              <button
                {...sharedStyles.plainButton}
                {...styles.button}
                {...colorScheme.set('backgroundColor', 'default')}
              >
                <ProgressCircle
                  progress={userProgress.percentage * 100}
                  strokeColorName='text'
                  strokePlaceholder
                  radius={RADIUS}
                  strokeWidth={3}
                />
                <IconArrowDownward
                  {...styles.buttonIcon}
                  {...colorScheme.set('fill', 'text')}
                />
              </button>
              <div {...styles.textBox}>
                <div {...styles.label}>{title}</div>
                <div
                  styles={{ fontSize: 16 }}
                  {...styles.note}
                  {...colorScheme.set('color', 'textSoft')}
                >
                  {datetime(
                    t,
                    new Date(userProgress.updatedAt),
                    'progress/restore',
                  )}
                </div>
              </div>

              <button
                {...styles.close}
                {...sharedStyles.plainButton}
                onClick={onClose}
                title={t('progress/restore/close')}
              >
                <IconClose size={30} fill='#000' />
              </button>
            </div>
          </div>
        </div>
      )}
    </AudioContext.Consumer>
  )
}

const styles = {
  container: css({
    '@media print': {
      display: 'none',
    },
    cursor: 'pointer',
    position: 'fixed',
    width: '100%',
    maxWidth: 414,
    right: 0,
    height: ALERT_HEIGHT,
    padding: '0 16px',
    zIndex: zIndex.callout,
    transition: 'all ease-out 0.3s',
    [mediaQueries.mUp]: {
      right: PADDING,
    },
  }),
  buttonBox: css({
    backgroundColor: 'white',
    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
    height: '100%',
  }),
  buttonBoxContent: css({
    position: 'absolute',
    left: PADDING * 2,
    right: PADDING * 2,
    top: 0,
    bottom: 0,
  }),
  button: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -RADIUS,
    left: `calc(50% - ${RADIUS}px)`,
    width: `${RADIUS * 2}px`,
    height: `${RADIUS * 2}px`,
    borderRadius: `${RADIUS}px`,
    padding: 0,
    [mediaQueries.mUp]: {
      left: 0,
      top: '50%',
      marginTop: -16,
    },
  }),
  buttonIcon: css({
    position: 'absolute',
    width: BUTTON_ICON_SIZE,
    height: BUTTON_ICON_SIZE,
    top: `calc(50% - ${BUTTON_ICON_SIZE / 2}px)`,
    left: `calc(50% - ${BUTTON_ICON_SIZE / 2}px)`,
  }),
  textBox: css({
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    left: 0,
    [mediaQueries.mUp]: {
      left: BUTTON_ICON_SIZE + 16 + PADDING,
      marginTop: -24,
    },
  }),
  close: css({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -14,
    textAlign: 'center',
  }),
  label: css({
    marginBottom: 2,
    fontSize: 16,
    [mediaQueries.mUp]: {
      right: 19,
      marginBottom: 5,
    },
  }),
  note: css({
    fontSize: 16,
  }),
}

RestoreButton.propTypes = {
  t: PropTypes.func,
  onClick: PropTypes.func,
  style: PropTypes.object,
  updatedAt: PropTypes.string,
}

export default withT(RestoreButton)
