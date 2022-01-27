import React, { useState } from 'react'
import {
  Label,
  fontStyles,
  plainButtonRule,
  Interaction,
  mediaQueries
} from '@project-r/styleguide'
import { baseCharts } from './config'
import { css, merge } from 'glamor'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'
import BackIcon from 'react-icons/lib/md/chevron-left'
import { styles as overlayStyles } from '../../../utils/OverlayForm'
import ChartActions from './ChartActions'

const styles = {
  chartWrapper: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridRowGap: 20,
    [mediaQueries.mUp]: {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridRowGap: 40
    }
  }),
  chartButtonContainer: css({
    height: '100%',
    display: 'flex'
  }),
  chartButton: css({
    height: 80,
    width: 120,
    whiteSpace: 'nowrap',
    ...fontStyles.sansSerifRegular14,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 auto',
    ':hover': {
      textDecoration: 'underline'
    },
    [mediaQueries.mUp]: {
      marginLeft: 0
    }
  }),
  chartImage: css({
    maxWidth: 60,
    maxHeight: 30,
    marginTop: 'auto'
  }),
  chartImageLarge: css({
    maxWidth: 130,
    maxHeight: 50
  }),
  chartButtonText: css({
    display: 'block',
    marginTop: 'auto',
    ':hover': {
      textDecoration: 'underline'
    }
  }),
  discreteButton: css({
    display: 'block',
    marginBottom: 30
  })
}

const ChartPreview = ({ CsvChart, chart }) => {
  const values = chart.values.trim()
  return (
    <>
      <Interaction.P>{chart.name}</Interaction.P>
      <div {...overlayStyles.edit}>
        <JSONEditor label='Einstellungen' config={chart.config} readOnly />
        <PlainEditor
          label='CSV Daten'
          value={values}
          linesShown={10}
          readOnly
        />
      </div>
      <div {...overlayStyles.preview}>
        <CsvChart config={chart.config} values={values} />
      </div>
      <br style={{ clear: 'both' }} />
    </>
  )
}

const ChartSelector = ({ data, CsvChart, onChartSelect }) => {
  const [preselected, preselect] = useState(undefined)
  const config = data.get('config') || {}
  const hasChanges = data.get('values') != '' || !!config.type

  return preselected ? (
    <>
      <Label>
        <button
          {...plainButtonRule}
          {...styles.discreteButton}
          onClick={() => preselect(undefined)}
        >
          <BackIcon size={16} /> Vorlagen durchsuchen
        </button>
      </Label>
      <ChartPreview chart={preselected} CsvChart={CsvChart} />
      <ChartActions
        onSelect={onChartSelect}
        config={{
          ...preselected.config,
          size: config.size
        }}
        values={preselected.values.trim()}
        cleanup={() => preselect(undefined)}
        buttonText='Überschreiben'
      />
    </>
  ) : (
    <div {...styles.chartWrapper}>
      {baseCharts.map(chart => {
        return (
          <div
            key={chart.name}
            {...styles.chartButton}
            onClick={() =>
              hasChanges
                ? preselect(chart)
                : onChartSelect(
                    {
                      ...chart.config,
                      size: config.size
                    },
                    chart.values.trim()
                  )
            }
          >
            <img
              src={chart.screenshot}
              {...merge(
                styles.chartImage,
                chart.large && styles.chartImageLarge
              )}
            />
            <span {...styles.chartButtonText}>{chart.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export default ChartSelector
