import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SlatePropTypes from 'slate-prop-types'
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

const EditButton = ({ onClick }) => (
  <div {...styles.editButton} role='button' onClick={onClick}>
    <MdEdit />
  </div>
)

class OverlayFormManager extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      showModal: false
    }
  }
  render() {
    const {
      editor,
      node,
      attributes,
      onChange,
      showEditButton,
      component,
      preview,
      extra,
      children
    } = this.props
    const startEditing = () => {
      this.setState({ showModal: true })
    }
    const showModal = this.state.showModal || node.data.get('isNew')

    return (
      <div
        {...attributes}
        style={{ position: 'relative' }}
        onDoubleClick={startEditing}
      >
        {showEditButton && <EditButton onClick={startEditing} />}
        {showModal && (
          <OverlayForm
            preview={preview}
            extra={extra}
            onClose={() => {
              this.setState({ showModal: false })
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
        {component || preview}
      </div>
    )
  }
}

OverlayFormManager.defaultProps = {
  showEditButton: true
}

OverlayFormManager.propTypes = {
  showEditButton: PropTypes.bool.isRequired,
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
