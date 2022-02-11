import React, { useContext, useEffect } from 'react'
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
  children,
}) => {
  const { showModal, setShowModal } = useContext(OverlayFormContext)
  const isNew = node.data.get('isNew')
  useEffect(() => {
    if (isNew) {
      setShowModal(true)
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data.delete('isNew'),
        })
      })
    }
  }, [isNew])

  return (
    <div {...attributes} style={{ position: 'relative' }}>
      {showModal && (
        <OverlayForm
          preview={preview}
          showPreview={showPreview}
          title={title}
          extra={extra}
          onClose={() => {
            setShowModal(false)
          }}
        >
          {children({ data: node.data, onChange })}
        </OverlayForm>
      )}
      <div onDoubleClick={() => setShowModal(true)}>{component || preview}</div>
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
    change: PropTypes.func.isRequired,
  }).isRequired,
  node: SlatePropTypes.node.isRequired,
}

export default OverlayFormManager
