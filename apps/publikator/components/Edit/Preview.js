import { useState } from 'react'
import { EditorToolbar, IconButton, colors } from '@project-r/styleguide'
import { editorToolbarStyle } from '../ContentEditor'
import PreviewFrame from '../PreviewFrame'
import { screenSizes } from '../ScreenSizePicker'

const Preview = ({ commitId, repoId }) => {
  const [previewScreenSize, setPreviewScreenSize] = useState('phone')

  return (
    <>
      <EditorToolbar
        mode='sticky'
        style={{ ...editorToolbarStyle, padding: 10 }}
        centered
      >
        {screenSizes.map(({ name, label, Icon }) => {
          return (
            <IconButton
              Icon={Icon}
              title={label}
              label={label}
              key={name}
              onClick={() => setPreviewScreenSize(name)}
              fill={name === previewScreenSize ? colors.primary : colors.text}
            />
          )
        })}
      </EditorToolbar>
      <PreviewFrame
        commitId={commitId}
        repoId={repoId}
        previewScreenSize={previewScreenSize}
        isFlyer
      />
    </>
  )
}

export default Preview
