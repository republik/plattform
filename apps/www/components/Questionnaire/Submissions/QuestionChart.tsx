import { max } from 'd3-array'
import { format } from 'd3-format'
import { scaleLinear } from 'd3-scale'
import { css } from 'glamor'
import { Fragment } from 'react'
import { useColorContext } from '@project-r/styleguide'

type Props = {
  answers: { answer: string; value: number }[]
  key: string
}

const styles = {
  chart: css({
    display: 'grid',
    rowGap: 12,
    // columnGap: '10%',
    width: '100%',
    gridTemplateRows: 'auto auto',
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
    opacity: 0.7,
    borderRadius: '7px 7px 0 0',
    marginTop: 12,
  }),
  barAndLabel: css({
    // display: "flex",
    // flexDirection: ""

    alignSelf: 'end',
    borderBottom: '1px solid currentColor',
    padding: '0 10%',
  }),
}

// const pct = format('.1~%') // rounded to 1/10
const pct = format('.0%') // rounded

export const QuestionSummaryChart = ({ answers }: Props) => {
  const [colorScheme] = useColorContext()
  const y = scaleLinear([0, max(answers, (d) => d.value)], [0, 100])

  return (
    <div {...styles.chart} {...colorScheme.set('color', 'text')}>
      {answers.map((d) => {
        return (
          <Fragment key={d.answer}>
            <div {...styles.barAndLabel}>
              <div {...styles.label}>{pct(d.value)}</div>

              <div
                {...styles.bar}
                style={{
                  height: y(d.value),
                }}
              ></div>
            </div>
            <div {...styles.label}>{d.answer}</div>
          </Fragment>
        )
      })}
    </div>
  )
}
