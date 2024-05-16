import React, { useMemo } from 'react'
import { css } from 'glamor'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import { useColorContext } from '../../../Colors/ColorContext'
import { Formatter } from '../../../../lib/translate'

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
  padding: '0',
}

const styles = {
  root: css({
    display: 'flex',
    flexFlow: 'wrap',
    alignItems: 'center',
  }),
  rootMainOnly: css({
    justifyContent: 'flex-end',
  }),
  rootWithSecondary: css({
    justifyContent: 'space-between',
  }),
  mainActions: css({
    display: 'flex',
    '& > *': {
      marginLeft: pxToRem(16),
    },
  }),
  secondaryButton: css({
    ...actionButtonStyle,
  }),
  primaryButton: css({
    ...actionButtonStyle,
    '[disabled]': {
      cursor: 'inherit',
    },
  }),
}

type ActionsProps = {
  t: Formatter
  onClose: () => void
  onPreview?: () => void
  onCloseLabel?: string
  onSubmit?: () => void
  onSubmitLabel?: string
  secondaryActions?: React.ReactNode
}

export const Actions = ({
  t,
  onClose,
  onCloseLabel,
  onSubmit,
  onSubmitLabel,
  onPreview,
  secondaryActions,
}: ActionsProps) => {
  const [colorScheme] = useColorContext()
  const styleRules = useMemo(() => {
    return {
      closeButton: css({
        color: colorScheme.getCSSColor('textSoft'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('text'),
          },
        },
      }),
      submitButton: css({
        color: colorScheme.getCSSColor('primary'),
        '[disabled]': {
          color: colorScheme.getCSSColor('disabled'),
        },
        '@media (hover)': {
          ':not([disabled]):hover': {
            color: colorScheme.getCSSColor('primaryHover'),
          },
        },
      }),
    }
  }, [colorScheme])
  return (
    <div
      {...styles.root}
      {...styles[secondaryActions ? 'rootWithSecondary' : 'rootMainOnly']}
    >
      {secondaryActions}

      <div {...styles.mainActions}>
        <button
          {...styles.secondaryButton}
          {...styleRules.closeButton}
          onClick={onClose}
        >
          {onCloseLabel || t('styleguide/CommentComposer/cancel')}
        </button>
        {onPreview && (
          <button
            {...styles.secondaryButton}
            {...styleRules.closeButton}
            onClick={onPreview}
          >
            {t('styleguide/CommentComposer/preview')}
          </button>
        )}
        <button
          {...styles.primaryButton}
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
