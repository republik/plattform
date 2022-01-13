import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext } from '../../DiscussionContext'
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
    alignItems: 'center'
  }),
  rootMainOnly: css({
    justifyContent: 'flex-end',
  }),
  rootWithSecondary: css({
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
    <div {...styles.root} {...styles[composerSecondaryActions ? 'rootWithSecondary' : 'rootMainOnly']}>
      {composerSecondaryActions}

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
