import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import {
  Overlay,
  OverlayToolbar,
  OverlayToolbarClose,
  OverlayBody,
  mediaQueries,
  ColorContextProvider,
  useColorContext,
  A
} from '@project-r/styleguide'

const mobilePreviewWidth = 320

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
  container: css({
    display: 'flex',
    flexDirection: 'column',
    [mediaQueries.mUp]: {
      flexDirection: 'row'
    }
  }),
  preview: css({
    flex: '1 1 50%',
    overflow: 'hidden'
  }),
  innerPreview: css({
    padding: '0 15px',
    overflow: 'hidden'
  }),
  edit: css({
    flex: '1 1 50%',
    [mediaQueries.mUp]: {
      paddingLeft: 20
    }
  }),
  contextBackground: css({
    position: 'relative',
    zIndex: 0,
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

const OverlayForm = ({ onClose, preview, extra, children }) => {
  const [colorScheme] = useColorContext()
  const [mobileView, setMobileView] = useState(false)
  const [renderedPreview, setRenderedPreview] = useState(preview)

  useEffect(() => setRenderedPreview(preview), [mobileView])

  const onViewSwitch = e => {
    e.preventDefault()
    setRenderedPreview(null) // otherwise svg doesn't resize
    setMobileView(!mobileView)
  }

  return (
    <Overlay
      onClose={onClose}
      mUpStyle={{ maxWidth: '80vw', marginTop: '5vh' }}
    >
      <OverlayToolbar>
        <OverlayToolbarClose onClick={onClose} />
      </OverlayToolbar>

      <OverlayBody>
        <div {...styles.container}>
          <div {...styles.preview}>
            <div style={{ width: mobileView ? mobilePreviewWidth : null }}>
              <div {...styles.innerPreview}>
                <ContextBackground>{renderedPreview}</ContextBackground>
                <br />
                <ColorContextProvider
                  colorSchemeKey={
                    colorScheme.schemeKey === 'dark' ? 'light' : 'dark'
                  }
                >
                  <ContextBackground>{renderedPreview}</ContextBackground>
                </ColorContextProvider>
                <br />
                <br />
                <div>
                  <A href='#' onClick={onViewSwitch}>
                    {mobileView ? 'full view' : 'mobile view'}
                  </A>
                </div>
                <br />
                {extra}
              </div>
            </div>
          </div>
          <div {...styles.edit}>{children}</div>
        </div>
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
