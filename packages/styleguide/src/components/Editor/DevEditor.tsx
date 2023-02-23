import React, { useEffect, useMemo, useState } from 'react'
import { CustomDescendant, EditorConfig } from './custom-types'
import { cleanupTree } from './Core/helpers/tree'
import { CodeSpecimen } from '@catalog/core'
import copyToClipboard from 'clipboard-copy'

import Button from '../Button'
import Editor from './index'

const DevEditor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  config: EditorConfig
}> = ({ value, setValue, config }) => {
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
    <div>
      <Editor value={value} setValue={setValue} config={config} />
      {config.debug && (
        <>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
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
    </div>
  )
}

export default DevEditor
