import { Component } from 'react'
import { css } from 'glamor'
import questionStyles from './questionStyles'
import { nest } from 'd3-collection'
import uuid from 'uuid/v4'
import { Loader } from '@project-r/styleguide'

import {
  Interaction,
  mediaQueries,
  Checkbox,
  Radio,
} from '@project-r/styleguide'
import withT from '../../lib/withT'
import dynamic from 'next/dynamic'
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
    columnCount: 1,
    [mediaQueries.mUp]: {
      columnCount: 2,
    },
    [mediaQueries.lUp]: {
      columnCount: 3,
    },
  }),
  optionImage: css({
    columnCount: 2,
    [mediaQueries.mUp]: {
      columnCount: 4,
    },
  }),
  option: css({
    marginTop: 0,
    marginBottom: 5,
    display: 'table',
    breakInside: 'avoid-column',
  }),
}

const LoadingComponent = () => <Loader loading />

const ImageChoice = dynamic(() => import('../Climatelab/ImageChoice'), {
  loading: LoadingComponent,
  ssr: false,
})

const CUSTOM_COMPONENTS = { ImageChoice }

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
      question: {
        text,
        explanation,
        userAnswer,
        cardinality,
        options,
        componentIdentifier,
      },
      t,
    } = this.props
    console.log(componentIdentifier)
    const multipleAllowed = cardinality === 0 || cardinality > 1
    const OptionComponent = componentIdentifier
      ? CUSTOM_COMPONENTS[componentIdentifier]
      : multipleAllowed
      ? Checkbox
      : Radio
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
              <div
                {...(multipleAllowed && styles.optionList)}
                {...(componentIdentifier && styles.optionImage)}
              >
                {values.map((o, i) => (
                  <div key={i} {...styles.option}>
                    <OptionComponent
                      onChange={(e) => {
                        e.preventDefault()
                        this.handleChange(o.value)
                      }}
                      checked={userAnswerValues.some((v) => v === o.value)}
                      imageUrl={o.imageUrl}
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
