import { useState } from 'react'
import { ColorContextProvider } from '@project-r/styleguide'
import { css } from 'glamor'

import PreviewFrame from './Frame'
import DarkmodeToggle from './DarkmodeToggle'
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
  isFlyer,
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
          isFlyer={isFlyer}
          commitOnly={commitOnly}
        />
      </div>
    </ColorContextProvider>
  )
}

export default Preview
