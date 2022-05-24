import React from 'react'
import {
  CustomDescendant,
  CustomElement,
  CustomText,
  SchemaType,
} from '../../custom-types'
import { config as elementsConfig } from '../config/elements'
import { Element as SlateElement } from 'slate'
import { Marks } from '../editor/ui/Mark'

const RenderedLeaf: React.FC<{
  leaf: CustomText
  schema: SchemaType
}> = ({ leaf, schema }) => (
  <Marks leaf={leaf} schema={schema}>
    {leaf.text}
  </Marks>
)

const RenderedElement: React.FC<{
  element: CustomElement
  schema: SchemaType
}> = ({ element, schema }) => {
  const { type, children, ...customElProps } = element
  const config = elementsConfig[type]
  const Component = config.Component[schema]
  return (
    <Component {...customElProps}>
      {children.map((node: CustomDescendant, i) =>
        SlateElement.isElement(node) ? (
          <RenderedElement element={node} schema={schema} key={i} />
        ) : (
          <RenderedLeaf leaf={node} schema={schema} key={i} />
        ),
      )}
    </Component>
  )
}

const SlateRender: React.FC<{
  value: CustomDescendant[]
  schema: SchemaType
}> = ({ value, schema }) => {
  return (
    <div>
      {value.map((element: CustomElement, i) => (
        <RenderedElement key={i} element={element} schema={schema} />
      ))}
    </div>
  )
}
export default SlateRender
