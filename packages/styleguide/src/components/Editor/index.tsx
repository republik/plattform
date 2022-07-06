import React, { useEffect, useMemo, useState } from 'react'
import { CustomDescendant, EditorConfig, NodeTemplate } from './custom-types'
import SlateEditor from './components/editor'
import ErrorBoundary from '../ErrorBoundary'
import { cleanupTree } from './components/editor/helpers/tree'
import { CodeSpecimen } from '@catalog/core'
import copyToClipboard from 'clipboard-copy'

import Button from '../Button'

const Editor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
  config: EditorConfig
}> = ({ value, setValue, structure, config }) => {
  const [copyLabel, setCopyLabel] = useState('Copy Tree')
  const displayValue = useMemo(
    () =>
      JSON.stringify(cleanupTree(JSON.parse(JSON.stringify(value))), null, 4),
    [value],
  )

  useEffect(() => {
    if (copyLabel !== 'Copy Tree') {
      setTimeout(() => {
        setCopyLabel('Copy Tree')
      }, 3000)
    }
  }, [copyLabel])

  return (
    <ErrorBoundary showException={true}>
      <div>
        <SlateEditor
          value={value}
          setValue={setValue}
          structure={structure}
          config={config}
        />
      </div>
      {config.debug && (
        <>
          <CodeSpecimen lang='javascript'>{displayValue}</CodeSpecimen>
          <Button
            small
            onClick={() =>
              copyToClipboard(displayValue)
                .then(() => setCopyLabel('Copied!'))
                .catch(() => setCopyLabel('Error :-/'))
            }
            style={{ marginTop: 10 }}
          >
            {copyLabel}
          </Button>
        </>
      )}
    </ErrorBoundary>
  )
}

export default Editor
