import { Component } from 'react'
import { css } from 'glamor'
import questionStyles from './../Questionnaire/questionStyles'
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

class ImageChoiceQuestion extends Component {
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
      question: { userAnswer },
    } = this.props
    const nextValue = new Set(userAnswer ? userAnswer.payload.value : [])

    nextValue.clear()
    nextValue.add(value)

    const { answerId } = this.state

    onChange(answerId, Array.from(nextValue))
  }

  render() {
    const {
      question: { text, userAnswer, options },
    } = this.props
    const optionGroups = nest()
      .key((o) => o.category)
      .entries(options)
    const userAnswerValues = userAnswer ? userAnswer.payload.value : []

    return (
      <div>
        <div {...questionStyles.label}>{text && <H2>{text}</H2>}</div>
        <div {...questionStyles.body} {...styles.options}>
          {optionGroups.map(({ key, values }) => (
            <div key={key} {...styles.optionGroup}>
              <div {...styles.optionImage}>
                {values.map((o, i) => (
                  <div key={i} {...styles.option}>
                    <ImageChoice
                      onChange={() => this.handleChange(o.value)}
                      checked={userAnswerValues.some((v) => v === o.value)}
                      imageUrl={o.imageUrl}
                    >
                      {o.label}
                    </ImageChoice>
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

export default withT(ImageChoiceQuestion)
