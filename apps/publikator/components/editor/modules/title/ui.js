import React from 'react'
import { Map } from 'immutable'

import { A, Label } from '@project-r/styleguide'

import { createPropertyForm } from '../../utils'
import MetaForm from '../../utils/MetaForm'

export default ({ TYPE, subModules, editorOptions }) => {
  const isTitleBlock = block =>
    block.type === TYPE || subModules.some(m => m.TYPE === block.type)
  const Form = createPropertyForm({
    isDisabled: ({ value }) => !value.blocks.some(isTitleBlock)
  })(({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }

    const { coverType, dynamicComponentCoverType } = editorOptions

    return (
      <div>
        {value.blocks
          .filter(isTitleBlock)
          .map(block =>
            block.type === TYPE ? block : value.document.getParent(block.key)
          )
          .filter(
            (block, index, all) =>
              all.indexOf(block) === index && block.type === TYPE
          )
          .map((block, i) => {
            const onInputChange = subject => key => (_, val) => {
              onChange(
                value.change().setNodeByKey(subject.key, {
                  data: val
                    ? subject.data.set(key, val)
                    : subject.data.remove(key)
                })
              )
            }
            const firstNode = value.document.nodes.first()

            const hasCover = firstNode.type === coverType
            const hasDynamicCover = firstNode.type === dynamicComponentCoverType

            const hasAnyCover = hasCover || hasDynamicCover

            return (
              <div key={`titleblock-${i}`}>
                <Label>Titel</Label>
                <br />
                <MetaForm
                  data={Map({
                    center: block.data.get('center') || false
                  })}
                  onInputChange={onInputChange(block)}
                />
                {hasAnyCover && (
                  <A
                    href='#'
                    onClick={e => {
                      e.preventDefault()
                      onChange(value.change().removeNodeByKey(firstNode.key))
                    }}
                  >
                    Cover entfernen
                  </A>
                )}
                {!!coverType && !hasAnyCover && (
                  <A
                    href='#'
                    onClick={e => {
                      e.preventDefault()
                      onChange(
                        value.change().insertNodeByKey(value.document.key, 0, {
                          kind: 'block',
                          type: coverType
                        })
                      )
                    }}
                  >
                    Cover hinzufügen
                  </A>
                )}
                <br />
                {!!dynamicComponentCoverType && !hasAnyCover && (
                  <A
                    href='#'
                    onClick={e => {
                      e.preventDefault()
                      onChange(
                        value.change().insertNodeByKey(value.document.key, 0, {
                          kind: 'block',
                          type: dynamicComponentCoverType
                        })
                      )
                    }}
                  >
                    Dynamic Component Cover hinzufügen
                  </A>
                )}
              </div>
            )
          })}
      </div>
    )
  })

  return {
    forms: [Form]
  }
}
