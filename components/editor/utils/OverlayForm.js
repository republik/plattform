import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import {
  Overlay,
  OverlayToolbar,
  OverlayToolbarClose,
  OverlayBody,
  mediaQueries,
  ColorContextProvider,
  useColorContext
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
  }),
  contextBackground: css({
    position: 'relative',
    zIndex: 0,
    overflow: 'auto',
    padding: '10px 15px',
    margin: '0 -15px'
  })
}

const ContextBackground = ({ children }) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('backgroundColor', 'default')}
      {...styles.contextBackground}
    >
      {children}
    </div>
  )
}

const OverlayForm = props => {
  const [colorScheme] = useColorContext()
  const { onClose, preview, extra, children } = props

  return (
    <Overlay
      onClose={onClose}
      mUpStyle={{ maxWidth: '80vw', marginTop: '5vh' }}
    >
      <OverlayToolbar>
        <OverlayToolbarClose onClick={onClose} />
      </OverlayToolbar>

      <OverlayBody>
        <div {...styles.preview}>
          <ContextBackground>{preview}</ContextBackground>
          <br />
          <ColorContextProvider
            colorSchemeKey={colorScheme.schemeKey === 'dark' ? 'light' : 'dark'}
          >
            <ContextBackground>{preview}</ContextBackground>
          </ColorContextProvider>
          <br />
          {extra}
        </div>
        <div {...styles.edit}>{children}</div>
        <br style={{ clear: 'both' }} />
      </OverlayBody>
    </Overlay>
  )
}

OverlayForm.propTypes = {
  preview: PropTypes.node,
  extra: PropTypes.node,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired
}

export default OverlayForm
