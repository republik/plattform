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
import { LayoutContainer } from '../editor/ui/Layout'
import { cleanupTree } from '../editor/helpers/tree'

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

export const RenderedElement: React.FC<{
  element: CustomElement
  schema: SchemaConfig
}> = ({ element, schema }) => {
  const { type, children, ...customElProps } = element
  const config = elConfig[type]
  if (!config) {
    console.warn('Config for', type, 'missing')
    return null
  }
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
}> = ({ value, schema }) => (
  <LayoutContainer schema={schema}>
    <RenderNodes nodes={cleanupTree(value, true)} schema={schema} />
  </LayoutContainer>
)
export default SlateRender
