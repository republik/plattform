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
    ...serifRegular16,
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
    ...sansSerifRegular12,
    lineHeight: 1,
    position: 'absolute',
    bottom: 6,
    left: 8
  })
}

export const CommentComposer = props => {
  const { t, isRoot, onClose, onCloseLabel, onSubmitLabel } = props

  /*
   * Get the discussion metadata and action callbacks from the DiscussionContext.
   *
   * The 'tagRequired' setting only applies to root comments.
   */
  const { discussion, actions } = React.useContext(DiscussionContext)
  const { tags, rules, displayAuthor } = discussion
  const tagRequired = isRoot && discussion.tagRequired
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

  const [text, setText] = React.useState(props.initialText || '')
  const onChangeText = ev => {
    setText(ev.target.value)
  }

  const [tagValue, setTagValue] = React.useState(props.tagValue)

  /*
   * We keep track of the submission process, to prevent the user from
   * submitting the comment multiple times.
   *
   * This also enables us to show a loading indicator.
   */
  const [{ loading, error }, setSubmit] = React.useState({ loading: false, error: undefined })
  const onSubmit = () => {
    if (root.current) {
      setSubmit({ loading: true, error })
      props.onSubmit({ text, tags: tagValue ? [tagValue] : undefined }).then(({ ok, error }) => {
        /*
         * We may have been umounted in the meantime. Use 'root.current' as a signal that we have
         * been so we can avoid calling React functions which generate warnings.
         */
        if (root.current) {
          if (ok) {
            /*
             * Set 'loading' true, to keep the onSubmit button disabled. Otherwise it
             * might become active again before our controller closes us.
             */
            setSubmit({ loading: true, error: undefined })
          } else if (error) {
            setSubmit({ loading: true, error })
          }
        }
      })
    }
  }

  const canSubmit = !loading && text && (!tagRequired || tagValue) && (!maxLength || text.length <= maxLength)

  return (
    <div ref={root} {...styles.root}>
      <div {...styles.background}>
        <div style={{ borderBottom: '1px solid white' }}>
          <Header t={t} displayAuthor={displayAuthor} onClick={actions.openDiscussionPreferences} />
        </div>

        {tags && (
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
          rows="1"
          onChange={onChangeText}
        />

        {maxLength && <MaxLengthIndicator maxLength={maxLength} length={text.length} />}
      </div>

      <Actions
        t={t}
        onClose={onClose}
        onCloseLabel={onCloseLabel}
        onSubmit={canSubmit ? onSubmit : undefined}
        onSubmitLabel={onSubmitLabel}
      />

      {error && <Error>{error}</Error>}
    </div>
  )
}

CommentComposer.propTypes = {
  t: PropTypes.func.isRequired,
  isRoot: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCloseLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onSubmitLabel: PropTypes.string
}

const MaxLengthIndicator = ({ maxLength, length }) => {
  const remaining = maxLength - length
  const color = remaining < 0 ? colors.error : remaining < 21 ? colors.text : colors.lightText

  return (
    <div {...styles.maxLengthIndicator} style={{ color }}>
      {remaining}
    </div>
  )
}
