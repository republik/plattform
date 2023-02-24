import { scaleLinear, scaleBand } from 'd3-scale'
import { max } from 'd3-array'
import { format } from 'd3-format'
import { Fragment } from 'react'
import { css } from 'glamor'
type Props = {
  answers: { answer: string; value: number }[]
  key: string
}

const styles = {
  chart: css({
    display: 'grid',
    rowGap: 12,
    columnGap: '10%',
    width: '100%',
    gridTemplateRows: 'auto 150px auto',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
  }),
  label: css({
    textAlign: 'center',
    alignSelf: 'center',
  }),
  bar: css({
    width: '100%',
    backgroundColor: `currentColor`,
    opacity: 0.8,
    borderRadius: 7,
    alignSelf: 'end',
  }),
}

const pct = format('.1~%') // rounded to 1/10
// const pct = format('.0%') // rounded

export const QuestionSummaryChart = ({ answers }: Props) => {
  const y = scaleLinear([0, max(answers, (d) => d.value)], [0, 100])

  return (
    <>
      <div {...styles.chart}>
        {answers.map((d) => {
          return (
            <Fragment key={d.answer}>
              <div {...styles.label}>{pct(d.value)}</div>

              <div
                {...styles.bar}
                style={{
                  height: `${y(d.value)}%`,
                }}
              ></div>
              <div {...styles.label}>{d.answer}</div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
