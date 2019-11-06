import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import {
  Overlay,
  OverlayToolbar,
  OverlayToolbarClose,
  OverlayBody,
  mediaQueries
} from '@project-r/styleguide'

const previewWidth = 290

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
  }),
  preview: css({
    [mediaQueries.mUp]: {
      float: 'left',
      width: previewWidth
    }
  }),
  edit: css({
    [mediaQueries.mUp]: {
      float: 'left',
      width: `calc(100% - ${previewWidth}px)`,
      paddingLeft: 20
    }
  })
}

class OverlayForm extends Component {
  constructor(...args) {
    super(...args)
    this.rootDiv = document.createElement('div')
    document.body.appendChild(this.rootDiv)
  }
  render() {
    const { onClose, preview, extra, children } = this.props

    return ReactDOM.createPortal(
      <Overlay
        onClose={onClose}
        mUpStyle={{ maxWidth: '80vw', marginTop: '5vh' }}
      >
        <OverlayToolbar>
          <OverlayToolbarClose onClick={onClose} />
        </OverlayToolbar>

        <OverlayBody>
          <div {...styles.preview}>
            {preview}
            <br />
            {extra}
          </div>
          <div {...styles.edit}>{children}</div>
          <br style={{ clear: 'both' }} />
        </OverlayBody>
      </Overlay>,
      this.rootDiv
    )
  }
}

OverlayForm.propTypes = {
  preview: PropTypes.node,
  extra: PropTypes.node,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired
}

export default OverlayForm
