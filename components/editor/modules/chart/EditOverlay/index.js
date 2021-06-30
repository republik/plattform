import React from 'react'
import OverlayFormManager from '../../../utils/OverlayFormManager'
import Export from '../Export'
import ChartEditor from './ChartEditor'
import { Accordion } from '@project-r/styleguide'

export default props => (
  <OverlayFormManager
    {...props}
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
      <Accordion>
        <ChartEditor
          data={data}
          onChange={onChange}
          CsvChart={props.CsvChart}
        />
      </Accordion>
    )}
  </OverlayFormManager>
)
