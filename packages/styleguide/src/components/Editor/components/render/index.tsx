import React from 'react'
import { CustomDescendant, CustomElement, CustomText } from '../../custom-types'
import { config as elementsConfig } from '../schema/elements'
import { Element as SlateElement } from 'slate'
import { Marks } from '../editor/ui/Mark'

const RenderedLeaf: React.FC<{
  leaf: CustomText
}> = ({ leaf }) => <Marks leaf={leaf}>{leaf.text}</Marks>

const RenderedElement: React.FC<{
  element: CustomElement
}> = ({ element }) => {
  const { type, children, ...customElProps } = element
  const config = elementsConfig[type]
  const Component = config.Component
  return (
    <Component {...customElProps}>
      {children.map((node: CustomDescendant, i) =>
        SlateElement.isElement(node) ? (
          <RenderedElement element={node} key={i} />
        ) : (
          <RenderedLeaf leaf={node} key={i} />
        ),
      )}
    </Component>
  )
}

const SlateRender: React.FC<{
  value: CustomDescendant[]
}> = ({ value }) => {
  return (
    <div>
      {value.map((element: CustomElement, i) => (
        <RenderedElement key={i} element={element} />
      ))}
    </div>
  )
}
export default SlateRender
