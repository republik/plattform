import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import Textarea from 'react-textarea-autosize'
import scrollIntoView from 'scroll-into-view'
import colors from '../../../theme/colors'
import { mBreakPoint } from '../../../theme/mediaQueries'
import { serifRegular16, sansSerifRegular12 } from '../../Typography/styles'

import { Header, Tags, Actions, Error } from '../Internal/Composer'
import { DiscussionContext } from '../DiscussionContext'
import { convertStyleToRem } from '../../Typography/utils'
import { LinkPreview } from '../Internal/Comment'

const styles = {
  root: css({}),
  background: css({
    position: 'relative',
    background: colors.secondaryBg
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
    color: colors.text
  }),
  textAreaEmpty: css({
    color: colors.lightText,
    '::-webkit-input-placeholder': {
      color: colors.lightText
    }
  }),
  textAreaLimit: css({
    paddingBottom: '28px'
  }),
  maxLengthIndicator: css({
    ...convertStyleToRem(sansSerifRegular12),
    lineHeight: 1,
    position: 'absolute',
    bottom: 6,
    left: 8
  })
}

/**
 * The key in localStorage under which we store the text. Keyed by the discussion ID.
 *
 * This is exported from the styleguide so that the frontend can reuse this. In
 * particular, this allows the frontend to directly display the CommentComposer
 * if there is text stored in localStorage.
 */
export const commentComposerStorageKey = discussionId =>
  `commentComposerText:${discussionId}`

export const CommentComposer = props => {
  const { t, isRoot, hideHeader, onClose, onCloseLabel, onSubmitLabel } = props

  /*
   * Get the discussion metadata and action callbacks from the DiscussionContext.
   */
  const { discussion, actions } = React.useContext(DiscussionContext)
  const { id, tags, rules, displayAuthor } = discussion
  const { maxLength } = rules

  /*
   * Refs
   *
   * We have one ref that is pointing to the root elment of the comment composer, and
   * another which gives us access to the <Textarea> input element. The later MUST be
   * a function-style ref because <Textarea> doesn't support React.useRef()-style refs.
   */
  const root = React.useRef()
  const [textarea, textareaRef] = React.useState(null)
  const textRef = React.useRef()
  const [preview, setPreview] = React.useState(null)

  /*
   * Focus the textarea upon mount.
   *
   * Furthermore, if we detect a small screen, scroll the whole elment to the top of
   * the viewport.
   */
  React.useEffect(() => {
    if (textarea) {
      textarea.focus()

      if (window.innerWidth < mBreakPoint) {
        scrollIntoView(root.current, { align: { top: 0, topOffset: 60 } })
      }
    }
  }, [textarea])

  /*
   * Synchronize the text with localStorage, and restore it from there if not otherwise
   * provided through props. This way the user won't lose their text if the browser
   * crashes or if they inadvertently close the composer.
   */
  const localStorageKey = commentComposerStorageKey(id)

  const fetchPreview = text => {
    if (!actions || !actions.previewComment) {
      return setPreview(null)
    }
    textRef.current = text
    actions
      .previewComment({ content: text, discussionId: id })
      .then(nextPreview => {
        if (textRef.current === text) {
          setPreview(nextPreview)
        }
      })
      .catch(() => {
        if (textRef.current === text) {
          setPreview(null)
        }
      })
  }

  const [text, setText] = React.useState(() => {
    if (props.initialText) {
      return props.initialText
    } else if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(localStorageKey) || ''
      } catch (e) {
        return ''
      }
    } else {
      return ''
    }
  })

  React.useEffect(() => {
    fetchPreview(text)
  }, [text])

  const onChangeText = ev => {
    const nextText = ev.target.value
    setText(nextText)
    try {
      localStorage.setItem(localStorageKey, ev.target.value)
    } catch (e) {
      /* Ignore errors */
    }
  }

  const [tagValue, setTagValue] = React.useState(props.tagValue)

  /*
   * We keep track of the submission process, to prevent the user from
   * submitting the comment multiple times.
   *
   * This also enables us to show a loading indicator.
   */
  const [{ loading, error }, setSubmit] = React.useState({
    loading: false,
    error: undefined
  })
  const onSubmit = () => {
    if (root.current) {
      setSubmit({ loading: true, error })
      props
        .onSubmit({ text, tags: tagValue ? [tagValue] : undefined })
        .then(({ ok, error }) => {
          /*
           * We may have been umounted in the meantime, so we use 'root.current' as a signal that
           * we have been so we can avoid calling React setState functions which generate warnings.
           *
           * In the case of success, we keep 'loading' true, to keep the onSubmit button disabled.
           * Otherwise it might become active again before our controller closes us, allowing the
           * user to click it again.
           */

          if (ok) {
            try {
              localStorage.removeItem(localStorageKey)
            } catch (e) {
              /* Ignore */
            }

            if (root.current) {
              setSubmit({ loading: true, error: undefined })
            }
          } else {
            if (root.current) {
              setSubmit({ loading: false, error })
            }
          }
        })
    }
  }

  return (
    <div ref={root} {...styles.root}>
      <div {...styles.background}>
        {!hideHeader && (
          <div style={{ borderBottom: '1px solid white' }}>
            <Header
              t={t}
              displayAuthor={displayAuthor}
              onClick={actions.openDiscussionPreferences}
            />
          </div>
        )}

        {/* Tags are only available in the root composer! */}
        {isRoot && tags && (
          <div style={{ borderBottom: '1px solid white' }}>
            <Tags tags={tags} onChange={setTagValue} value={tagValue} />
          </div>
        )}

        <Textarea
          inputRef={textareaRef}
          {...styles.textArea}
          {...(maxLength ? styles.textAreaLimit : {})}
          {...(text === '' ? styles.textAreaEmpty : {})}
          placeholder={t('styleguide/CommentComposer/placeholder')}
          value={text}
          rows='1'
          onChange={onChangeText}
        />

        {maxLength && (
          <MaxLengthIndicator maxLength={maxLength} length={text.length} />
        )}
      </div>

      <LinkPreview comment={preview} />

      <Actions
        t={t}
        onClose={onClose}
        onCloseLabel={onCloseLabel}
        onSubmit={loading ? undefined : onSubmit}
        onSubmitLabel={onSubmitLabel}
      />

      {error && <Error>{error}</Error>}
    </div>
  )
}

CommentComposer.propTypes = {
  t: PropTypes.func.isRequired,
  isRoot: PropTypes.bool.isRequired,
  hideHeader: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onCloseLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onSubmitLabel: PropTypes.string
}

const MaxLengthIndicator = ({ maxLength, length }) => {
  const remaining = maxLength - length
  const color =
    remaining < 0
      ? colors.error
      : remaining < 21
      ? colors.text
      : colors.lightText

  if (remaining > maxLength * 0.33) {
    return null
  }

  return (
    <div {...styles.maxLengthIndicator} style={{ color }}>
      {remaining}
    </div>
  )
}
