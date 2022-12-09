import PropTypes from 'prop-types'
import { css, merge } from 'glamor'

import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  mediaQueries,
  ColorContextProvider,
  useColorContext,
} from '@project-r/styleguide'

const previewWidth = 300

export const styles = {
  editButton: css({
    position: 'absolute',
    left: -40,
    top: 0,
    zIndex: 1,
    fontSize: 24,
    ':hover': {
      cursor: 'pointer',
    },
  }),
  preview: css({
    [mediaQueries.mUp]: {
      float: 'left',
      width: previewWidth,
      maxWidth: previewWidth,
      paddingLeft: 15,
      marginRight: 20,
      overflow: 'hidden',
    },
  }),
  edit: css({
    [mediaQueries.mUp]: {
      float: 'left',
      width: `calc(100% - ${previewWidth + 35}px)`,
      paddingRight: 30,
    },
  }),
  noPreview: css({
    [mediaQueries.mUp]: {
      width: '100%',
      paddingRight: 0,
    },
  }),
  contextBackground: css({
    position: 'relative',
    zIndex: 0,
    padding: '10px 15px',
    margin: '0 -15px',
  }),
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

const OverlayForm = ({
  onClose,
  preview,
  extra,
  children,
  title,
  showPreview = true,
}) => {
  const [colorScheme] = useColorContext()

  return (
    <Overlay
      onClose={onClose}
      mUpStyle={{ maxWidth: '85vw', marginTop: '5vh' }}
    >
      <OverlayToolbar onClose={onClose} title={title} />
      <OverlayBody>
        <div {...merge(styles.edit, !showPreview && styles.noPreview)}>
          {children}
        </div>
        {showPreview && (
          <div {...styles.preview}>
            {extra && <div style={{ marginBottom: 15 }}>{extra}</div>}
            <div style={{ marginBottom: 15 }}>
              <ContextBackground>{preview}</ContextBackground>
            </div>
            <ColorContextProvider
              colorSchemeKey={
                colorScheme.schemeKey === 'dark' ? 'light' : 'dark'
              }
            >
              <ContextBackground>{preview}</ContextBackground>
            </ColorContextProvider>
          </div>
        )}
        <br style={{ clear: 'both' }} />
      </OverlayBody>
    </Overlay>
  )
}

OverlayForm.propTypes = {
  preview: PropTypes.node,
  extra: PropTypes.node,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
}

export default OverlayForm
