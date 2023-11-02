import { Component } from 'react'
import { css } from 'glamor'
import questionStyles from './questionStyles'
import { nest } from 'd3-collection'
import uuid from 'uuid/v4'

import {
  Interaction,
  mediaQueries,
  Checkbox,
  Radio,
} from '@project-r/styleguide'
import withT from '../../lib/withT'
const { H2, H3, P } = Interaction

const styles = {
  options: css({
    display: 'flex',
    width: '100%',
    flexWrap: 'wrap',
    marginTop: 20,
  }),
  optionGroup: css({
    width: '100%',
  }),
  optionGroupHeader: css({
    marginTop: 5,
    marginBottom: 15,
  }),
  optionList: css({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridAutoRows: 'auto',
    [mediaQueries.mUp]: {
      gridTemplateColumns: '1fr 1fr',
    },
    [mediaQueries.lUp]: {
      gridTemplateColumns: '1fr 1fr 1fr',
    },
  }),
  option: css({
    marginTop: 0,
    marginBottom: 5,
  }),
}

class ChoiceQuestion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      answerId:
        (props.question.userAnswer && props.question.userAnswer.id) || uuid(),
    }
  }

  handleChange = (value) => {
    const {
      onChange,
      question: { userAnswer, cardinality },
    } = this.props
    const nextValue = new Set(userAnswer ? userAnswer.payload.value : [])

    if (cardinality === 0 || cardinality > 1) {
      if (nextValue.has(value)) {
        nextValue.delete(value)
      } else {
        nextValue.add(value)
      }
    } else {
      nextValue.clear()
      nextValue.add(value)
    }

    const { answerId } = this.state

    onChange(answerId, Array.from(nextValue))
  }

  render() {
    const {
      question: { text, explanation, userAnswer, cardinality, options },
      t,
    } = this.props
    const multipleAllowed = cardinality === 0 || cardinality > 1
    const OptionComponent = multipleAllowed ? Checkbox : Radio
    const optionGroups = nest()
      .key((o) => o.category)
      .entries(options)
    const userAnswerValues = userAnswer ? userAnswer.payload.value : []

    return (
      <div>
        <div {...questionStyles.label}>
          {text && <H2>{text}</H2>}
          {(multipleAllowed || explanation) && (
            <P {...questionStyles.help}>
              {explanation || t('questionnaire/choice/helpMultiple')}
            </P>
          )}
        </div>
        <div {...questionStyles.body} {...styles.options}>
          {optionGroups.map(({ key, values }) => (
            <div key={key} {...styles.optionGroup}>
              {key !== 'null' && <H3 {...styles.optionGroupHeader}>{key}</H3>}
              <div {...(multipleAllowed && styles.optionList)}>
                {values.map((o, i) => (
                  <div key={i} {...styles.option}>
                    <OptionComponent
                      onChange={() => this.handleChange(o.value)}
                      checked={userAnswerValues.some((v) => v === o.value)}
                    >
                      {o.label}
                    </OptionComponent>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default withT(ChoiceQuestion)
