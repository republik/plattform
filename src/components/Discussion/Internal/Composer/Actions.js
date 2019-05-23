import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../../../theme/colors'
import { sansSerifMedium14 } from '../../../Typography/styles'

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
    '&:hover': {
      color: colors.text
    }
  }),
  submitButton: css({
    ...actionButtonStyle,
    color: colors.primary,
    marginLeft: '16px',
    '&[disabled]': {
      color: colors.disabled,
      cursor: 'inherit'
    },
    '&:not([disabled]):hover': {
      color: colors.secondary
    }
  }),
  secondaryActions: css({
    display: 'flex'
  }),
  secondaryAction: css({
    ...actionButtonStyle,
    color: colors.lightText,
    margin: '0 8px',
    '&:hover': {
      color: colors.text
    }
  })
}

export const Actions = (props) => {
  const {
    t,
    onClose,
    onCloseLabel = t('styleguide/CommentComposer/cancel'),
    onSubmit,
    onSubmitLabel = t('styleguide/CommentComposer/answer'),
    secondaryActions
  } = props

  return (
    <div {...styles.root}>
      {secondaryActions && (
        <div {...styles.secondaryActions}>
          {secondaryActions}
        </div>
      )}

      <div {...styles.mainActions}>
        <button {...styles.closeButton} onClick={onClose}>
          {onCloseLabel}
        </button>
        <button {...styles.submitButton} onClick={onSubmit} disabled={!onSubmit}>
          {onSubmitLabel}
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
  onSubmitLabel: PropTypes.string,
  secondaryActions: PropTypes.object
}

export const SecondaryAction = ({ as = "button", ...props }) => {
  return React.createElement(as, { ...styles.secondaryAction, ...props })
}
