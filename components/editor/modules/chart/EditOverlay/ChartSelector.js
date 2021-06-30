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
  chartButtonContainer: css({
    height: '100%',
    display: 'flex'
  }),
  chartButton: css({
    height: '100%',
    width: 130,
    whiteSpace: 'nowrap',
    padding: '30px 10px',
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
  }),
  warning: css({
    display: 'block'
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
      <div>
        <PlainEditor
          label='Datenstruktur'
          value={values}
          linesShown={3}
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
  const hasData = data.get('values') != ''
  const hasConfig = !!config.type
  const warning =
    hasData && hasConfig
      ? 'Daten und Einstellungen'
      : hasData
      ? 'Daten'
      : hasConfig
      ? 'Einstellungen'
      : false
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
              <div key={chart.name} {...styles.chartButtonContainer}>
                <div
                  {...styles.chartButton}
                  {...styles.discreteButton}
                  onClick={() => preselect(chart)}
                >
                  <img src={chart.screenshot} {...styles.chartImage} />
                  <span {...styles.chartButtonText}>{chart.name}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ padding: '10px 0' }}>
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
              Danke, nein.
            </button>
          </Label>
        )}
        {preselected && warning && (
          <Label {...styles.warning}>
            <em>Sie haben schon {warning} definiert.</em>
          </Label>
        )}
      </div>
    </>
  )
}

export default ChartSelector
