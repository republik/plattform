import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import Textarea from 'react-textarea-autosize';
import scrollIntoView from 'scroll-into-view'
import colors from '../../../theme/colors'
import { serifRegular16, sansSerifRegular14 } from '../../Typography/styles'

import ProgressCircle from '../../Progress/Circle'
import { Header, Tags, Actions, Error } from '../Internal/Composer'

const styles = {
  root: css({}),
  background: css({
    background: colors.secondaryBg
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
    padding: '8px 12px'
  }),
  remaining: css({
    ...sansSerifRegular14,
    lineHeight: 1,
    padding: '0 5px'
  })
}

export class CommentComposer extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      text: props.initialText || '',
      tagValue: props.tagValue,
      error: undefined
    }

    this.root = React.createRef()

    this.onChange = ev => {
      this.setState({ text: ev.target.value })
    }

    this.onSubmit = () => {
      const { text, tagValue } = this.state

      this.setState({ error: undefined })
      this.props.onSubmit({ text, tags: tagValue ? [tagValue] : undefined }).catch(error => {
        this.setState({ error })
      })
    }

    // MUST be a function because <Textarea> doesn't support
    // React.createRef()-style refs.
    this.textarea = null
    this.textareaRef = (ref) => {
      this.textarea = ref
    }

    this.onTagChange = (tagValue) => {
      this.setState({ tagValue })
      this.props.onTagChange && this.props.onTagChange(tagValue)
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
    const { text, tagValue, error } = this.state
    const maxLengthExceeded = maxLength && text.length > maxLength

    return (
      <div ref={this.root} {...styles.root}>
        <div {...styles.background}>
          <div style={{ borderBottom: '1px solid white' }}>
            <Header
              t={t}
              displayAuthor={displayAuthor}
              onClick={onEditPreferences}
            />
          </div>

          {tags && (
            <div style={{ borderBottom: '1px solid white' }}>
              <Tags
                tags={tags}
                onChange={this.onTagChange}
                value={tagValue}
              />
            </div>
          )}

          <Textarea
            inputRef={this.textareaRef}
            {...styles.textArea}
            {...(text === '' ? styles.textAreaEmpty : {})}
            placeholder={t('styleguide/CommentComposer/placeholder')}
            value={text}
            rows='1'
            onChange={this.onChange}
          />

          {maxLength && (
            <MaxLengthIndicator
              maxLength={maxLength}
              length={text.length}
            />
          )}
        </div>

        <Actions
          t={t}
          onClose={onClose}
          onCloseLabel={cancelLabel}
          onSubmit={(!text || (tagRequired && !tagValue) || maxLengthExceeded) ? undefined : this.onSubmit}
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
  const progress = length / maxLength * 100
  const remaining = maxLength - length
  const progressColor = progress > 100 ? colors.error : colors.text

  return (
    <div {...styles.maxLength}>
      {remaining < 21 && <span {...styles.remaining} style={{ color: progressColor }}>
        {remaining}
      </span>}
      <ProgressCircle
        stroke={progressColor}
        radius={9}
        strokeWidth={2}
        progress={Math.min(progress, 100)}
      />
    </div>
  )
}
