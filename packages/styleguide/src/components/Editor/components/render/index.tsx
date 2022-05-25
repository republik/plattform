import React from 'react'
import {
  CustomDescendant,
  CustomElement,
  CustomNode,
  CustomText,
  SchemaConfig,
} from '../../custom-types'
import { config as elConfig } from '../../config/elements'
import { Element as SlateElement } from 'slate'
import { Marks } from '../editor/ui/Mark'

const RenderedLeaf: React.FC<{
  leaf: CustomText
  schema: SchemaConfig
}> = ({ leaf, schema }) => (
  <Marks leaf={leaf} schema={schema}>
    {leaf.text}
  </Marks>
)

const RenderNodes: React.FC<{
  nodes: CustomNode[]
  schema: SchemaConfig
}> = ({ nodes, schema }) => (
  <>
    {nodes.map((node: CustomDescendant, i) =>
      SlateElement.isElement(node) ? (
        <RenderedElement element={node} schema={schema} key={i} />
      ) : (
        <RenderedLeaf leaf={node} schema={schema} key={i} />
      ),
    )}
  </>
)

const RenderedElement: React.FC<{
  element: CustomElement
  schema: SchemaConfig
}> = ({ element, schema }) => {
  const { type, children, ...customElProps } = element
  const config = elConfig[type]
  const Component = schema[config.component]
  // console.log({ type })
  if (!Component) {
    console.warn('Component for', element.type, 'missing')
    return null
  }
  return (
    <Component {...customElProps}>
      <RenderNodes nodes={children} schema={schema} />
    </Component>
  )
}

const SlateRender: React.FC<{
  value: CustomDescendant[]
  schema: SchemaConfig
}> = ({ value, schema }) => {
  return (
    <div>
      <RenderNodes nodes={value} schema={schema} />
    </div>
  )
}
export default SlateRender
