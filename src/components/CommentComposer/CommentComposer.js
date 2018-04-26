import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'
import Textarea from 'react-textarea-autosize';
import colors from '../../theme/colors'
import {serifRegular16, sansSerifRegular14, sansSerifRegular16} from '../Typography/styles'

import CommentComposerHeader from './CommentComposerHeader'
import CommentComposerError from './CommentComposerError'
import CommentComposerProgress from './CommentComposerProgress'

const actionButtonStyle = {
  ...sansSerifRegular16,
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  padding: '0 12px',
  cursor: 'pointer',
  alignSelf: 'stretch',
  display: 'flex',
  alignItems: 'center'
}

const styles = {
  form: css({
    background: colors.secondaryBg,
    borderTop: '1px solid white'
  }),
  textArea: css({
    padding: '6px 12px 0',
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
  maxLength: css({
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '-10px',
    padding: '0 12px'
  }),
  remaining: css({
    ...sansSerifRegular14,
    lineHeight: '20px',
    padding: '0 5px'
  }),
  actions: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px'
  }),
  mainActions: css({
    display: 'flex',
    alignItems: 'center',
    height: '40px'
  }),
  cancelButton: css({
    ...actionButtonStyle,
    color: colors.text
  }),
  commitButton: css({
    ...actionButtonStyle,
    color: colors.primary,
    '&[disabled]': {
      color: colors.disabled
    }
  }),
  secondaryActions: css({
    padding: '0 12px'
  })
}

class CommentComposer extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      text: props.initialText || '',
      count: 0,
      progress: 0
    }

    this.onChange = ev => {
      this.setState({text: ev.target.value})
      this.updateMaxLength()
    }

    this.onSubmit = () => {
      this.props.submitComment(this.state.text)
    }

    this.textarea = null
    this.textareaRef = (ref) => {
      this.textarea = ref
    }

    this.getCount = () => (
      (this.textarea && this.textarea.value.length) || 0
    )
  }

  updateMaxLength () {
    if (this.props.maxLength) {
      this.setState({
        count: this.getCount(),
        progress: this.getCount() / this.props.maxLength * 100
      })
    }
  }

  componentDidMount () {
    if (this.textarea) {
      this.textarea.focus()
      this.updateMaxLength()
    }
  }

  renderProgress () {
    const {maxLength} = this.props
    if (!maxLength) return null

    const {count, progress} = this.state
    const remaining = maxLength - count
    const progressColor = progress > 100 ? colors.error : colors.text
    return (
      <div {...styles.maxLength}>
        {remaining < 21 && <span {...styles.remaining} style={{color: progressColor}}>
          {remaining}
        </span>}
        <CommentComposerProgress
          stroke={progressColor}
          radius={9}
          strokeWidth={2}
          progress={Math.min(progress, 100)}
        />
      </div>
    )
  }

  render () {
    const {
      t,
      displayAuthor,
      error,
      onEditPreferences,
      onCancel,
      submitLabel,
      cancelLabel,
      secondaryActions,
      maxLength
    } = this.props
    const {text, count} = this.state
    const maxLengthExceeded = maxLength && count > maxLength

    return (
      <div>
        <CommentComposerHeader
          {...displayAuthor}
          onClick={onEditPreferences}
        />

        <div {...styles.form}>
          <Textarea
            inputRef={this.textareaRef}
            {...styles.textArea}
            {...(text === '' ? styles.textAreaEmpty : {})}
            placeholder={t('styleguide/CommentComposer/placeholder')}
            value={text}
            rows='1'
            onChange={this.onChange}
          />
          {this.renderProgress()}
          <div {...styles.actions}>
            {secondaryActions && (
              <div {...styles.secondaryActions}>
                {secondaryActions}
              </div>
            )}
            <div {...styles.mainActions}>
              <button {...styles.cancelButton} onClick={onCancel}>
                {cancelLabel || t('styleguide/CommentComposer/cancel')}
              </button>
              <button {...styles.commitButton} onClick={this.onSubmit} disabled={maxLengthExceeded}>
                {submitLabel || t('styleguide/CommentComposer/answer')}
              </button>
            </div>
          </div>
        </div>
        {error && <CommentComposerError>{error}</CommentComposerError>}
      </div>
    )
  }
}

CommentComposer.propTypes = {
  t: PropTypes.func.isRequired,
  displayAuthor: PropTypes.object.isRequired,
  error: PropTypes.string,
  onEditPreferences: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitComment: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  secondaryActions: PropTypes.object,
  maxLength: PropTypes.number
}

export default CommentComposer
