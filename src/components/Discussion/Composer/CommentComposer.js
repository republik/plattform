import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import Textarea from 'react-textarea-autosize'
import scrollIntoView from 'scroll-into-view'
import colors from '../../../theme/colors'
import { serifRegular16, sansSerifRegular12 } from '../../Typography/styles'

import { Header, Tags, Actions, Error } from '../Internal/Composer'

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

export class CommentComposer extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      text: props.initialText || '',
      tagValue: props.tagValue,

      /*
       * We keep track of the submission process, to prevent the user from
       * submitting the comment multiple times.
       *
       * This also enables us to show a loading indicator.
       */
      submit: { loading: false, error: undefined }
    }

    this.root = React.createRef()

    this.onChange = ev => {
      this.setState({ text: ev.target.value })
    }

    this.onSubmit = () => {
      const { text, tagValue, submit } = this.state

      this.setState({ submit: { ...submit, loading: true } })
      this.props.onSubmit({ text, tags: tagValue ? [tagValue] : undefined }).then(({ ok, error }) => {
        if (ok) {
          /*
           * Set 'loading' true, to keep the onSubmit button disabled. Otherwise it
           * might become active again before our controller closes us.
           */
          this.setState({ submit: { loading: true, error: undefined } })
        } else if (error) {
          this.setState({ submit: { loading: false, error } })
        }
      })
    }

    // MUST be a function because <Textarea> doesn't support
    // React.createRef()-style refs.
    this.textarea = null
    this.textareaRef = ref => {
      this.textarea = ref
    }

    this.onTagChange = tagValue => {
      this.setState({ tagValue })
    }
  }

  componentDidMount() {
    if (this.textarea) {
      this.textarea.focus()
    }

    // Scroll the viewport such that the composer is aligned to the top.
    // scrollIntoView(this.root.current, {
    //   align: { top: 0, topOffset: 60 }
    // })
  }

  render() {
    const {
      t,
      displayAuthor,
      onClose,
      onEditPreferences,
      submitLabel,
      cancelLabel,
      secondaryActions,
      maxLength,
      tagRequired,
      tags
    } = this.props
    const {
      text,
      tagValue,
      submit: { loading, error }
    } = this.state
    const canSubmit = !loading && text && (!tagRequired || tagValue) && (!maxLength || text.length <= maxLength)

    return (
      <div ref={this.root} {...styles.root}>
        <div {...styles.background}>
          <div style={{ borderBottom: '1px solid white' }}>
            <Header t={t} displayAuthor={displayAuthor} onClick={onEditPreferences} />
          </div>

          {tags && (
            <div style={{ borderBottom: '1px solid white' }}>
              <Tags tags={tags} onChange={this.onTagChange} value={tagValue} />
            </div>
          )}

          <Textarea
            inputRef={this.textareaRef}
            {...styles.textArea}
            {...(maxLength ? styles.textAreaLimit : {})}
            {...(text === '' ? styles.textAreaEmpty : {})}
            placeholder={t('styleguide/CommentComposer/placeholder')}
            value={text}
            rows="1"
            onChange={this.onChange}
          />

          {maxLength && <MaxLengthIndicator maxLength={maxLength} length={text.length} />}
        </div>

        <Actions
          t={t}
          onClose={onClose}
          onCloseLabel={cancelLabel}
          onSubmit={canSubmit ? this.onSubmit : undefined}
          onSubmitLabel={submitLabel}
          secondaryActions={secondaryActions}
        />

        {error && <Error>{error}</Error>}
      </div>
    )
  }
}

CommentComposer.propTypes = {
  t: PropTypes.func.isRequired,
  displayAuthor: PropTypes.object.isRequired,
  onEditPreferences: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCloseLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onSubmitLabel: PropTypes.string,
  secondaryActions: PropTypes.object,
  maxLength: PropTypes.number,
  tagRequired: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.string)
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
