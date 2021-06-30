import React from 'react'
import { Interaction, Label, fontStyles, A } from '@project-r/styleguide'
import { baseCharts } from '../config'
import { css } from 'glamor'

const styles = {
  chartWrapper: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridAutoRows: 120
  }),
  chartButton: css({
    whiteSpace: 'nowrap',
    padding: '30px 10px 30px 0px',
    textAlign: 'center',
    ...fontStyles.sansSerifRegular14,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }),
  chartImage: css({
    maxWidth: 60,
    maxHeight: 40
  }),
  chartButtonText: css({
    display: 'block',
    marginTop: 'auto'
  })
}

export const ResetChart = ({ onChange, data }) => {
  const reset = () => {
    onChange(
      data
        .set('config', {
          size: data.get('config')?.size
        })
        .set('values', '')
    )
  }
  return (
    <Interaction.P>
      <Label>
        <A href='#reset-chart' onClick={reset}>
          Andere Vorlage wählen und neu anfangen.
        </A>
      </Label>
    </Interaction.P>
  )
}

const ChartSelector = ({ onChange, data }) => {
  const config = data.get('config') || {}
  return (
    <div {...styles.chartWrapper}>
      {baseCharts.map(chart => {
        return (
          <div
            key={chart.name}
            {...styles.chartButton}
            onClick={() => {
              onChange(
                data
                  .set('config', {
                    ...chart.config,
                    size: config.size
                  })
                  .set('values', chart.values.trim())
              )
            }}
          >
            <img src={chart.screenshot} {...styles.chartImage} />
            <span {...styles.chartButtonText}>{chart.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export default ChartSelector
