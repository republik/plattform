import {
  ElementConfigI,
  ElementFormProps,
  MemoElement,
} from '../../custom-types'
import React from 'react'
import MemoForm from '../../Forms/Memo'
import { useRenderContext } from '../../Render/Context'
import { Marker } from '../../../Marker'
import renderAsText from '../../Render/text'
import { Interaction } from '../../../Typography'
import { unwrapWhenEmpty } from './_shared/utils'
import { IconMemo } from '@republik/icons'

const Form: React.FC<ElementFormProps<MemoElement>> = ({
  element,
  onChange,
}) => {
  const { t, repoId, commitId } = useRenderContext()

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
      MarkedSection={
        <Interaction.P>
          <Marker marker={element.marker}>
            {renderAsText(element.children)}
          </Marker>
        </Interaction.P>
      }
    />
  )
}

export const config: ElementConfigI = {
  Form,
  attrs: {
    isInline: true,
    stopFormIteration: true,
  },
  button: { icon: IconMemo, small: true },
  normalizations: [unwrapWhenEmpty],
  structure: [{ type: 'inherit' }],
  props: ['parentId', 'marker'],
}
