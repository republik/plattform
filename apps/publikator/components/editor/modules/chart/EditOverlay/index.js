import React, { useState } from 'react'
import OverlayFormManager from '../../../utils/OverlayFormManager'
import Export from '../Export'
import ChartEditor from './ChartEditor'
import ChartSelector from './ChartSelector'
import ChartCatalog from './ChartCatalog'
import { Tab } from './Tabs'
import { css } from 'glamor'

const tabs = ['chart', 'templates', 'catalog']
const tabConfig = {
  chart: { body: ChartEditor, label: 'Chart', showPreview: true },
  templates: { body: ChartSelector, label: 'Vorlagen', showPreview: false },
  catalog: { body: ChartCatalog, label: 'Archiv', showPreview: false }
}

const styles = {
  tabContainer: css({
    height: '100%',
    display: 'flex'
  })
}

const hasData = node =>
  node.data.get('config')?.type || node.data.get('values') != ''

const Overlay = props => {
  const [tab, setTab] = useState(hasData(props.node) ? 'chart' : 'templates')
  const title = (
    <div {...styles.tabContainer}>
      {tabs.map(tabKey => (
        <Tab
          key={tabKey}
          tabKey={tabKey}
          label={tabConfig[tabKey].label}
          setTab={setTab}
          isActive={tab === tabKey}
        />
      ))}
    </div>
  )
  const TabBody = tabConfig[tab].body

  return (
    <OverlayFormManager
      {...props}
      title={title}
      showPreview={tabConfig[tab].showPreview}
      extra={<Export chart={props.preview} />}
      onChange={data => {
        props.editor.change(change => {
          const size = data.get('config', {}).size
          const parent = change.value.document.getParent(props.node.key)
          if (size !== parent.data.get('size')) {
            change.setNodeByKey(parent.key, {
              data: parent.data.set('size', size)
            })
          }
          change.setNodeByKey(props.node.key, {
            data
          })
        })
      }}
    >
      {({ data, onChange }) => {
        const onChartSelect = (config, values, cleanup) => {
          onChange(
            data
              .set('config', config)
              .set('values', values ? values.trim() : data.get('values'))
          )
          cleanup && cleanup()
          setTab('chart')
        }
        return (
          <TabBody
            data={data}
            onChange={onChange}
            CsvChart={props.CsvChart}
            setTab={setTab}
            onChartSelect={onChartSelect}
          />
        )
      }}
    </OverlayFormManager>
  )
}

export default Overlay
