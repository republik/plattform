import {
  ElementConfigI,
  ElementFormProps,
  MemoElement,
} from '../../custom-types'
import { MemoIcon } from '../../../Icons'
import React from 'react'
import MemoForm from '../../Forms/Memo'
import { useRenderContext } from '../../Render/Context'
import { RenderedElement } from '../../Render'
import { unwrapWhenEmpty } from '../../Core/helpers/tree'

const Form: React.FC<ElementFormProps<MemoElement>> = ({
  element,
  onChange,
}) => {
  const { t, repoId, commitId, schema } = useRenderContext()

  return (
    <MemoForm
      t={t}
      repoId={repoId}
      commitId={commitId}
      parentId={element.parentId}
      setParentId={(parentId) => onChange({ parentId })}
      marker={element.marker}
      setMarker={(marker) => onChange({ marker })}
      deleteMemo={false}
      MarkedSection={<RenderedElement element={element} schema={schema} />}
    />
  )
}

export const config: ElementConfigI = {
  Form,
  attrs: {
    isInline: true,
    stopFormIteration: true,
  },
  button: { icon: MemoIcon, small: true },
  normalizations: [unwrapWhenEmpty],
  structure: [{ type: 'inherit' }],
  props: ['parentId', 'marker'],
}
