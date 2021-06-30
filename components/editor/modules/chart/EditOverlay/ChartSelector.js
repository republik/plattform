import React, { useContext, useState } from 'react'
import {
  Label,
  fontStyles,
  AccordionContext,
  plainButtonRule,
  colors
} from '@project-r/styleguide'
import { baseCharts } from '../config'
import { css } from 'glamor'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'

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
  }),
  chartPreviewContainer: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridGap: 20,
    padding: 10
  }),
  greenButton: css({
    color: colors.primary
  }),
  discreteButton: css({
    float: 'right',
    ':hover': {
      textDecoration: 'underline'
    }
  })
}

const ChartPreview = ({ CsvChart, chart }) => {
  const values = chart.values.trim()
  return (
    <div {...styles.chartPreviewContainer}>
      <div {...styles.chartPreviewColumn}>
        <Label>Chart Typ: {chart.config.type}</Label>
        <br />
        <br />
        <CsvChart config={chart.config} values={values} />
      </div>
      <div {...styles.chartPreviewColumn}>
        <PlainEditor
          label='Datenstruktur'
          value={values}
          linesShown={2}
          readOnly
        />
        <JSONEditor
          label='Einstellungen'
          config={chart.config}
          linesShown={10}
          readOnly
        />
      </div>
    </div>
  )
}

const ChartSelector = ({ onChange, data, CsvChart }) => {
  const [preselected, preselect] = useState()
  const { setActiveItemIndex } = useContext(AccordionContext)
  const config = data.get('config') || {}
  const nextAccordionItem = () => setActiveItemIndex('dataInput')
  const onSelect = (chart, configOnly = false) => {
    onChange(
      data
        .set('config', {
          ...chart.config,
          size: config.size
        })
        .set('values', configOnly ? data.get('values') : chart.values.trim())
    )
    preselect(undefined)
    nextAccordionItem()
  }
  return (
    <>
      {preselected ? (
        <ChartPreview
          chart={preselected}
          CsvChart={CsvChart}
          onSelect={onSelect}
        />
      ) : (
        <div {...styles.chartWrapper}>
          {baseCharts.map(chart => {
            return (
              <div
                key={chart.name}
                {...styles.chartButton}
                {...styles.discreteButton}
                onClick={() => preselect(chart)}
              >
                <img src={chart.screenshot} {...styles.chartImage} />
                <span {...styles.chartButtonText}>{chart.name}</span>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ padding: '20px 0' }}>
        {preselected ? (
          <Label>
            <button
              {...plainButtonRule}
              {...styles.greenButton}
              onClick={() => onSelect(preselected)}
            >
              Vorlage übernehmen
            </button>{' '}
            (oder nur{' '}
            <button
              {...plainButtonRule}
              {...styles.greenButton}
              onClick={() => onSelect(preselected, true)}
            >
              Einstellungen kopieren
            </button>
            )
            <button
              {...plainButtonRule}
              {...styles.discreteButton}
              onClick={() => preselect(undefined)}
            >
              Weitere Beispiele anschauen
            </button>
          </Label>
        ) : (
          <Label>
            <button
              {...plainButtonRule}
              {...styles.greenButton}
              onClick={nextAccordionItem}
            >
              Ohne Vorlage weiter
            </button>
          </Label>
        )}
      </div>
    </>
  )
}

export default ChartSelector
