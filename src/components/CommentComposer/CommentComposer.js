import React, {PureComponent} from 'react'
import {css} from 'glamor'
import colors from '../../theme/colors'
import {serifRegular16, sansSerifRegular16} from '../Typography/styles'
import {MdClose} from 'react-icons/lib/md'

import CommentComposerHeader from './CommentComposerHeader'

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
    minHeight: '100px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    ...serifRegular16,
    color: colors.text
  }),
  textAreaEmpty: css({
    color: colors.lightText,
  }),
  actions: css({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '40px'
  }),
  cancelButton: css({
    '-webkit-appearance': 'none',
    background: 'transparent',
    border: 'none',
    padding: '0 6px',
    cursor: 'pointer',

    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px'
  }),
  commitButton: css({
    '-webkit-appearance': 'none',
    background: 'transparent',
    border: 'none',
    padding: '0 12px 0 6px',
    cursor: 'pointer',

    ...sansSerifRegular16,
    color: colors.primary,

    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center'
  })
}

class CommentComposer extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      text: ''
    }

    this.onChange = ev => {
      this.setState({text: ev.target.value})
    }

    this.onSubmit = () => {
      this.props.submitComment(this.state.text)
    }
  }

  render () {
    const {t, displayAuthor, onEditPreferences, onCancel} = this.props
    const {text} = this.state

    return (
      <div>
        <CommentComposerHeader
          {...displayAuthor}
          onClick={onEditPreferences}
        />

        <div {...styles.form}>
          <textarea
            {...styles.textArea}
            {...(text === '' ? styles.textAreaEmpty : {})}
            placeholder={t('styleguide/CommentComposer/placeholder')}
            value={text}
            rows='5'
            onChange={this.onChange}
          />

          <div {...styles.actions}>
            <button {...styles.cancelButton} onClick={onCancel}>
              <MdClose />
            </button>
            <button {...styles.commitButton} onClick={this.onSubmit}>
              {t('styleguide/CommentComposer/answer')}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default CommentComposer
