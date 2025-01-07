import { Component } from 'react'
import questionStyles from './questionStyles'
import debounce from 'lodash/debounce'
import { v4 as uuid } from 'uuid'

import { Interaction } from '@project-r/styleguide'
import TextInput from './TextInput/TextInput'
import withT from '../../lib/withT'
const { P } = Interaction

class TextQuestion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      answerId:
        (props.question.userAnswer && props.question.userAnswer.id) || uuid(),
      ...this.deriveStateFromProps(props),
    }
  }

  deriveStateFromProps(props) {
    return props.question.userAnswer
      ? props.question.userAnswer.payload
      : { value: null }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.question.userAnswer !== this.props.question.userAnswer) {
      this.setState(this.deriveStateFromProps(nextProps))
    }
  }

  onChangeDebounced = debounce(this.props.onChange, 1000)

  handleChange = (ev) => {
    const {
      question: { maxLength },
    } = this.props
    const { answerId } = this.state

    const value = ev.target.value
    if (value.length <= +maxLength) {
      this.setState({ value })
      this.onChangeDebounced(answerId, value)
    }
  }

  render() {
    const {
      question: { text, explanation, maxLength, order, metadata },
      t,
    } = this.props
    const { value } = this.state
    const beforeP = metadata && metadata.beforeP
    return (
      <div>
        {beforeP && <P style={{ marginTop: 50, marginBottom: 0 }}>{beforeP}</P>}
        {text && <P {...questionStyles.label}><b>{order + 1}. {text}</b></P>}
        {explanation && <P {...questionStyles.help}>{explanation}</P>}
        <TextInput
          label={t('questionnaire/text/label')}
          text={value || ''}
          onChange={this.handleChange}
          maxLength={maxLength}
        />
      </div>
    )
  }
}

export default withT(TextQuestion)
