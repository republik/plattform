import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import SlatePropTypes from 'slate-prop-types'
import OverlayForm from './OverlayForm'
import { OverlayFormContext } from './OverlayFormContext'

const OverlayFormManager = ({
  editor,
  node,
  attributes,
  onChange,
  component,
  preview,
  extra,
  showPreview,
  title,
  children
}) => {
  const { showModal, setShowModal } = useContext(OverlayFormContext)
  const startEditing = () => setShowModal(true)
  const isOpen = showModal || node.data.get('isNew')

  return (
    <div {...attributes} style={{ position: 'relative' }}>
      {isOpen && (
        <OverlayForm
          preview={preview}
          showPreview={showPreview}
          title={title}
          extra={extra}
          onClose={() => {
            setShowModal(false)
            node.data.get('isNew') &&
              editor.change(change => {
                change.setNodeByKey(node.key, {
                  data: node.data.delete('isNew')
                })
              })
          }}
        >
          {children({ data: node.data, onChange })}
        </OverlayForm>
      )}
      <div onDoubleClick={startEditing}>{component || preview}</div>
    </div>
  )
}

OverlayFormManager.propTypes = {
  onChange: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  component: PropTypes.node,
  preview: PropTypes.node,
  extra: PropTypes.node,
  attributes: PropTypes.object,
  editor: PropTypes.shape({
    change: PropTypes.func.isRequired
  }).isRequired,
  node: SlatePropTypes.node.isRequired
}

export default OverlayFormManager
