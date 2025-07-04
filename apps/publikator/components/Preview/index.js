import { ColorContextProvider } from '@project-r/styleguide'
import { css } from 'glamor'
import { useState } from 'react'
import DarkmodeToggle from './DarkmodeToggle'

import PreviewFrame from './Frame'
import HasAccessToggle from './HasAccessToggle'
import ScreeenSizePicker from './ScreenSizePicker'

const styles = {
  darkmodeButton: css({
    position: 'absolute',
    margin: '-26px 0 0 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  hasPreviewButton: css({
    position: 'absolute',
    margin: '-26px 0 0 64px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
}

const Preview = ({
  commitId,
  repoId,
  sideBarWidth = 0,
  commitOnly,
  darkmode,
}) => {
  const [previewScreenSize, setPreviewScreenSize] = useState('phone')
  const [previewDarkmode, setPreviewDarkmode] = useState(darkmode)
  const [previewHasAccess, setPreviewHasAccess] = useState(true)
  return (
    <ColorContextProvider colorSchemeKey={previewDarkmode ? 'dark' : 'light'}>
      <div style={{ paddingTop: 40 }}>
        <div style={{ marginRight: sideBarWidth }}>
          <ScreeenSizePicker
            selectedScreenSize={previewScreenSize}
            onSelect={(screenSize) => {
              setPreviewScreenSize(screenSize)
            }}
            inline={true}
          />
          <div {...styles.darkmodeButton}>
            <DarkmodeToggle
              previewDarkmode={previewDarkmode}
              onToggle={() => setPreviewDarkmode(!previewDarkmode)}
            />
          </div>
          <div {...styles.hasPreviewButton}>
            <HasAccessToggle
              previewHasAccess={previewHasAccess}
              onToggle={() => setPreviewHasAccess(!previewHasAccess)}
            />
          </div>
        </div>
        <PreviewFrame
          previewScreenSize={previewScreenSize}
          repoId={repoId}
          commitId={commitId}
          darkmode={previewDarkmode}
          hasAccess={previewHasAccess}
          sideBarWidth={sideBarWidth}
          commitOnly={commitOnly}
        />
      </div>
    </ColorContextProvider>
  )
}

export default Preview
