import React, { Component } from 'react'
import { css } from 'glamor'

import MdEdit from 'react-icons/lib/md/edit'

import EditModal from './EditModal'

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

class EditManager extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      showModal: false
    }
  }
  render () {
    const { node, attributes, chart, editor } = this.props
    const startEditing = () => {
      this.setState({showModal: true})
    }
    const showModal = this.state.showModal || node.data.get('isNew')

    return <div {...attributes} style={{position: 'relative'}}
      onDoubleClick={startEditing}>
      <EditButton onClick={startEditing} />
      {showModal && (
        <EditModal data={node.data} chart={chart}
          onChange={(data) => {
            editor.change(change => {
              const size = data.get('config', {}).size
              const parent = change.value.document.getParent(node.key)
              if (size !== parent.data.get('size')) {
                change.setNodeByKey(parent.key, {
                  data: parent.data.set('size', size)
                })
              }
              change.setNodeByKey(node.key, {
                data
              })
            })
          }}
          onClose={() => {
            this.setState({showModal: false})
            node.data.get('isNew') && editor.change(change => {
              change.setNodeByKey(node.key, {
                data: node.data.delete('isNew')
              })
            })
          }} />
      )}
      {chart}
    </div>
  }
}

export default EditManager
