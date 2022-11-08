import {
  ElementConfigI,
  ElementFormProps,
  MemoElement,
} from '../../custom-types'
import { MemoIcon } from '../../../Icons'
import React from 'react'
import MemoForm from '../../Forms/Memo'
import { useRenderContext } from '../../Render/Context'
import { unwrapWhenEmpty } from '../../Core/helpers/tree'
import { Marker } from '../../../Marker'
import renderAsText from '../../Render/text'
import { Interaction } from '../../../Typography'

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
  button: { icon: MemoIcon, small: true },
  normalizations: [unwrapWhenEmpty],
  structure: [{ type: 'inherit' }],
  props: ['parentId', 'marker'],
}
