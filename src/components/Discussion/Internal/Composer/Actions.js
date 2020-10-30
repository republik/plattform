import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext } from '../../DiscussionContext'
import { mUp } from '../../../../theme/mediaQueries'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import { useColorContext } from '../../../Colors/useColorContext'

const actionButtonStyle = {
  ...convertStyleToRem(sansSerifMedium14),
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  alignSelf: 'stretch',
  display: 'flex',
  alignItems: 'center',
  minHeight: pxToRem(40),
  lineHeight: pxToRem(40),
  padding: '0'
}

const styles = {
  root: css({
    display: 'flex',
    flexFlow: 'wrap',
    justifyContent: 'space-between'
  }),
  mainActions: css({
    display: 'flex'
  }),
  closeButton: css({
    ...actionButtonStyle
  }),
  submitButton: css({
    ...actionButtonStyle,
    marginLeft: '16px',
    '[disabled]': {
      cursor: 'inherit'
    }
  }),
  secondaryActions: css({
    height: pxToRem(20),
    display: 'flex',
    minWidth: 0,
    flexShrink: 1
  }),
  secondaryAction: css({
    ...actionButtonStyle,
    margin: '0 4px',
    [mUp]: {
      margin: '0 8px'
    }
  })
}

export const Actions = ({
  t,
  onClose,
  onCloseLabel,
  onSubmit,
  onSubmitLabel
}) => {
  const [colorScheme] = useColorContext()
  const { composerSecondaryActions } = React.useContext(DiscussionContext)
  const styleRules = useMemo(() => {
    return {
      secondaryAction: css({
        color: colorScheme.getCSSColor('textSoft'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('text')
          }
        }
      }),
      closeButton: css({
        color: colorScheme.getCSSColor('textSoft'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('text')
          }
        }
      }),
      submitButton: css({
        color: colorScheme.getCSSColor('primary'),
        '[disabled]': {
          color: colorScheme.getCSSColor('disabled')
        },
        '@media (hover)': {
          ':not([disabled]):hover': {
            color: colorScheme.getCSSColor('primaryHover')
          }
        }
      })
    }
  }, [colorScheme])
  return (
    <div {...styles.root}>
      {composerSecondaryActions && (
        <div {...styles.secondaryActions} {...styleRules.secondaryAction}>
          {composerSecondaryActions}
        </div>
      )}

      <div {...styles.mainActions}>
        <button
          {...styles.closeButton}
          {...styleRules.closeButton}
          onClick={onClose}
        >
          {onCloseLabel || t('styleguide/CommentComposer/cancel')}
        </button>
        <button
          {...styles.submitButton}
          {...styleRules.submitButton}
          onClick={onSubmit}
          disabled={!onSubmit}
        >
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
