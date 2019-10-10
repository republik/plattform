import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../../../theme/colors'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext } from '../../DiscussionContext'
import { mUp } from '../../../../theme/mediaQueries'

const actionButtonStyle = {
  ...sansSerifMedium14,
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  alignSelf: 'stretch',
  display: 'flex',
  alignItems: 'center',
  height: '40px',
  lineHeight: '40px',
  padding: '0'
}

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between'
  }),
  mainActions: css({
    marginLeft: 'auto',
    display: 'flex'
  }),
  closeButton: css({
    ...actionButtonStyle,
    color: colors.lightText,
    marginLeft: '16px',
    '@media (hover)': {
      ':hover': {
        color: colors.text
      }
    }
  }),
  submitButton: css({
    ...actionButtonStyle,
    color: colors.primary,
    marginLeft: '16px',
    '[disabled]': {
      color: colors.disabled,
      cursor: 'inherit'
    },
    '@media (hover)': {
      ':not([disabled]):hover': {
        color: colors.secondary
      }
    }
  }),
  secondaryActions: css({
    display: 'flex',
    minWidth: 0,
    flexShrink: 1
  }),
  secondaryAction: css({
    ...actionButtonStyle,
    color: colors.lightText,
    margin: '0 4px',
    [mUp]: {
      margin: '0 8px'
    },
    '@media (hover)': {
      ':hover': {
        color: colors.text
      }
    }
  })
}

export const Actions = ({ t, onClose, onCloseLabel, onSubmit, onSubmitLabel }) => {
  const { composerSecondaryActions } = React.useContext(DiscussionContext)

  return (
    <div {...styles.root}>
      {composerSecondaryActions && <div {...styles.secondaryActions}>{composerSecondaryActions}</div>}

      <div {...styles.mainActions}>
        <button {...styles.closeButton} onClick={onClose}>
          {onCloseLabel || t('styleguide/CommentComposer/cancel')}
        </button>
        <button {...styles.submitButton} onClick={onSubmit} disabled={!onSubmit}>
          {onSubmitLabel || t('styleguide/CommentComposer/answer')}
        </button>
      </div>
    </div>
  )
}

Actions.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCloseLabel: PropTypes.string,
  onSubmit: PropTypes.func,
  onSubmitLabel: PropTypes.string
}

export const SecondaryAction = ({ as = 'button', ...props }) => {
  return React.createElement(as, { ...styles.secondaryAction, ...props })
}
