import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import Textarea from 'react-textarea-autosize'
import scrollIntoView from 'scroll-into-view'
import { mBreakPoint } from '../../../theme/mediaQueries'
import { serifRegular16, sansSerifRegular12 } from '../../Typography/styles'

import { Header, Tags, Actions, Error } from '../Internal/Composer'
import { convertStyleToRem } from '../../Typography/utils'
import { useColorContext } from '../../Colors/ColorContext'
import { deleteDraft, readDraft, writeDraft } from './CommentDraftHelper'
import { DisplayAuthorPropType } from '../Internal/PropTypes'
import { CommentUI } from '../Tree/CommentNode'
import Loader from '../../Loader'
import { fontStyles } from '../../Typography'

const styles = {
  root: css({}),
  background: css({
    position: 'relative',
  }),
  textArea: css({
    display: 'block',
    padding: '20px 8px',
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: '60px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    ...convertStyleToRem(serifRegular16),
  }),
  textAreaLimit: css({
    paddingBottom: '28px',
  }),
  maxLengthIndicator: css({
    ...convertStyleToRem(sansSerifRegular12),
    lineHeight: 1,
    position: 'absolute',
    bottom: 6,
    left: 8,
  }),
  withBorderBottom: css({
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  }),
  hints: css({
    marginTop: 6,
  }),
  previewWrapper: css({
    padding: '8px',
  }),
  previewLabel: css({
    ...fontStyles.sansSerifMedium18,
    display: 'block',
    marginBottom: '16px',
  }),
}

const propTypes = {
  t: PropTypes.func.isRequired,
  isRoot: PropTypes.bool.isRequired,

  discussionId: PropTypes.string,
  parentId: PropTypes.string,
  commentId: PropTypes.string,

  onSubmit: PropTypes.func.isRequired,
  onSubmitLabel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onCloseLabel: PropTypes.string,
  onOpenPreferences: PropTypes.func,
  onPreviewComment: PropTypes.func,

  // Disable because of TS funkiness
  // secondaryActions: PropTypes.node,
  hintValidators: PropTypes.arrayOf(PropTypes.func),

  displayAuthor: DisplayAuthorPropType,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),

  initialText: PropTypes.string,
  initialTagValue: PropTypes.string,

  autoFocus: PropTypes.bool,
  hideHeader: PropTypes.bool,
}

export const CommentComposer = ({
  t,
  isRoot,

  discussionId,
  commentId,
  parentId,

  onSubmit,
  onSubmitLabel,
  onClose,
  onCloseLabel,
  onOpenPreferences,
  onPreviewComment,

  secondaryActions,
  hintValidators = [],

  displayAuthor,
  placeholder,
  maxLength,
  tags,

  // Initial values
  initialText,
  initialTagValue,

  autoFocus = true,
  hideHeader,
}) => {
  const [colorScheme] = useColorContext()
  /*
   * Refs
   *
   * We have one ref that is pointing to the root element of the comment composer, and
   * another which gives us access to the <Textarea> input element. The later MUST be
   * a function-style ref because <Textarea> doesn't support React.useRef()-style refs.
   */
  const root = useRef()
  const [textarea, textareaRef] = useState(null)
  const [hints, setHints] = useState([])
  const textRef = useRef()

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [preview, setPreview] = useState({
    loading: false,
    error: null,
    comment: null,
  })

  /*
   * Synchronize the text with localStorage, and restore it from there if not otherwise
   * provided through props. This way the user won't lose their text if the browser
   * crashes or if they inadvertently close the composer.
   *
   * This is only done when not editing. Edits are currently not supported by the store.
   */
  const isEditing = !!commentId
  const [text, setText] = useState(() => {
    if (initialText) {
      return initialText
    } else if (!isEditing) {
      return readDraft(discussionId, parentId) || ''
    } else {
      return ''
    }
  })

  const textLength =
    isPreviewing && preview.comment
      ? preview.comment.contentLength
      : text.length

  const [selectedTagValue, setSelectedTagValue] = useState()
  // we adapt to the initialTagValue as long as no tag has been selected
  const tagValue = selectedTagValue || initialTagValue

  const fetchPreview = async () => {
    setPreview({
      loading: true,
      error: null,
      comment: null,
    })
    try {
      const result = await onPreviewComment({
        discussionId,
        parentId,
        content: text,
        id: commentId,
        tags: tagValue ? [tagValue] : undefined,
      })
      setPreview({
        loading: false,
        error: null,
        comment: result,
      })
    } catch (e) {
      setPreview({
        loading: false,
        error: e,
        comment: null,
      })
    }
  }

  /*
   * Focus the textarea upon mount.
   *
   * Furthermore, if we detect a small screen, scroll the whole element to the top of
   * the viewport.
   */
  useEffect(() => {
    if (textarea && autoFocus) {
      textarea.focus()

      if (window.innerWidth < mBreakPoint) {
        scrollIntoView(root.current, { align: { top: 0, topOffset: 60 } })
      }
    }
  }, [textarea, autoFocus])

  textRef.current = text

  const onChangeText = (ev) => {
    const nextText = ev.target.value
    setText(nextText)
    setHints(hintValidators.map((fn) => fn(nextText)).filter(Boolean))
    if (!isEditing) {
      writeDraft(discussionId, parentId, ev.target.value)
    }
  }

  /*
   * We keep track of the submission process, to prevent the user from
   * submitting the comment multiple times.
   *
   * This also enables us to show a loading indicator.
   */
  const [{ loading, error }, setSubmit] = React.useState({
    loading: false,
    error: undefined,
  })
  const submitHandler = () => {
    if (root.current) {
      setSubmit({ loading: true, error })
      onSubmit({ text, tags: tagValue ? [tagValue] : undefined }).then(
        ({ ok, error }) => {
          /*
           * We may have been umounted in the meantime, so we use 'root.current' as a signal that
           * we have been so we can avoid calling React setState functions which generate warnings.
           *
           * In the case of success, we keep 'loading' true, to keep the onSubmit button disabled.
           * Otherwise it might become active again before our controller closes us, allowing the
           * user to click it again.
           */

          if (ok) {
            if (!isEditing) {
              deleteDraft(discussionId, parentId)
            }
            onClose()

            if (root.current) {
              setSubmit({ loading: true, error: undefined })
            }
          } else {
            if (root.current) {
              setSubmit({ loading: false, error })
            }
          }
        },
      )
    }
  }

  const textAreaEmptyRule = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor('textSoft'),
        '::-webkit-input-placeholder': {
          color: colorScheme.getCSSColor('textSoft'),
        },
      }),
    [colorScheme],
  )

  return (
    <div ref={root} {...styles.root}>
      <div {...styles.background} {...colorScheme.set('background', 'hover')}>
        {!isPreviewing ? (
          <>
            {!hideHeader && (
              <div
                {...styles.withBorderBottom}
                {...colorScheme.set('borderColor', 'default')}
              >
                <Header
                  t={t}
                  displayAuthor={displayAuthor}
                  onClick={onOpenPreferences}
                />
              </div>
            )}
            {/* Tags are only available in the root composer! */}
            {isRoot && tags && (
              <div
                {...styles.withBorderBottom}
                {...colorScheme.set('borderColor', 'default')}
              >
                <Tags
                  tags={tags}
                  onChange={setSelectedTagValue}
                  value={tagValue}
                />
              </div>
            )}
            <>
              <Textarea
                inputRef={textareaRef}
                {...styles.textArea}
                {...colorScheme.set('color', 'text')}
                {...(maxLength ? styles.textAreaLimit : {})}
                {...(text === '' ? textAreaEmptyRule : {})}
                placeholder={
                  placeholder ?? t('styleguide/CommentComposer/placeholder')
                }
                value={text}
                rows='1'
                onChange={onChangeText}
              />
              {hints &&
                hints.map((hint, index) => (
                  <div {...styles.hints} key={`hint-${index}`}>
                    {hint}
                  </div>
                ))}
            </>
            {maxLength && (
              <MaxLengthIndicator maxLength={maxLength} length={textLength} />
            )}
          </>
        ) : (
          <div {...styles.previewWrapper}>
            <span {...styles.previewLabel}>
              {t('styleguide/CommentComposer/preview')}
            </span>
            <Loader
              loading={preview.loading}
              error={preview.error}
              render={() => (
                <CommentUI
                  t={t}
                  comment={{
                    ...preview.comment,
                    displayAuthor,
                  }}
                  isExpanded
                  isPreview
                />
              )}
            />
          </div>
        )}
      </div>

      <Actions
        t={t}
        onClose={() => {
          if (isPreviewing) {
            setIsPreviewing(false)
          } else {
            deleteDraft(discussionId, parentId)
            onClose()
            // Delete the draft of the field
          }
        }}
        onCloseLabel={
          isPreviewing
            ? t('styleguide/CommentComposer/exitPreview')
            : onCloseLabel
        }
        onSubmit={
          loading || (maxLength && textLength > maxLength)
            ? undefined
            : submitHandler
        }
        onSubmitLabel={onSubmitLabel}
        onPreview={
          onPreviewComment && !isPreviewing
            ? () => {
                fetchPreview()
                setIsPreviewing(true)
              }
            : undefined
        }
        secondaryActions={secondaryActions}
      />
      {error && <Error>{error}</Error>}
    </div>
  )
}

CommentComposer.propTypes = propTypes

const MaxLengthIndicator = ({ maxLength, length }) => {
  const [colorScheme] = useColorContext()
  const remaining = maxLength - length
  if (remaining > maxLength * 0.33) {
    return null
  }

  return (
    <div
      {...styles.maxLengthIndicator}
      {...colorScheme.set(
        'color',
        remaining < 0 ? 'error' : remaining < 21 ? 'text' : 'textSoft',
      )}
    >
      {remaining}
    </div>
  )
}
