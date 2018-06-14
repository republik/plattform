import React, { Component } from 'react'
import { css } from 'glamor'

import MdEdit from 'react-icons/lib/md/edit'

import OverlayForm from './OverlayForm'

const styles = {
  editButton: css({
    position: 'absolute',
    left: -40,
    top: 0,
    zIndex: 1,
    fontSize: 24,
    ':hover': {
      cursor: 'pointer'
    }
  })
}

const EditButton = ({onClick}) => (
  <div {...styles.editButton}
    role='button'
    onClick={onClick}>
    <MdEdit />
  </div>
)

class OverlayFormManager extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      showModal: false
    }
  }
  render () {
    const { node, attributes, onChange, preview, extra, editor, children } = this.props
    const startEditing = () => {
      this.setState({showModal: true})
    }
    const showModal = this.state.showModal || node.data.get('isNew')

    return <div {...attributes} style={{position: 'relative'}}
      onDoubleClick={startEditing}>
      <EditButton onClick={startEditing} />
      {showModal && (
        <OverlayForm
          preview={preview}
          extra={extra}
          onClose={() => {
            this.setState({showModal: false})
            node.data.get('isNew') && editor.change(change => {
              change.setNodeByKey(node.key, {
                data: node.data.delete('isNew')
              })
            })
          }}>
          {children({data: node.data, onChange})}
        </OverlayForm>
      )}
      {preview}
    </div>
  }
}

export default OverlayFormManager
