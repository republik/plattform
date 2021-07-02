import React, { useState } from 'react'
import OverlayFormManager from '../../../utils/OverlayFormManager'
import Export from '../Export'
import ChartEditor from './ChartEditor'
import ChartSelector from './ChartSelector'
import { plainButtonRule } from '@project-r/styleguide'

const tabs = ['edit', 'templates']
const tabConfig = {
  edit: { body: ChartEditor, label: 'Bearbeiten', showPreview: true },
  templates: { body: ChartSelector, label: 'Vorlage', showPreview: false }
}

const Tab = ({ tabKey, setTab, isActive }) => (
  <button {...plainButtonRule} onClick={() => setTab(tabKey)}>
    {tabConfig[tabKey].label}
  </button>
)

export default props => {
  const [tab, setTab] = useState('templates')
  const overlayToolBarActions = (
    <>
      {tabs.map(tabKey => (
        <Tab
          key={tabKey}
          tabKey={tabKey}
          setTab={setTab}
          isActive={tab === tabKey}
        />
      ))}
    </>
  )
  const TabBody = tabConfig[tab].body

  return (
    <OverlayFormManager
      {...props}
      overlayToolBarActions={overlayToolBarActions}
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
      {({ data, onChange }) => (
        <TabBody data={data} onChange={onChange} CsvChart={props.CsvChart} />
      )}
    </OverlayFormManager>
  )
}
