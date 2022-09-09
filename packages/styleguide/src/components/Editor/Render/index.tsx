import React, { Fragment } from 'react'
import {
  CustomDescendant,
  CustomElement,
  CustomNode,
  CustomText,
  SchemaConfig,
} from '../custom-types'
import { Marks } from './Mark'
import { LayoutContainer } from './Containers'
import { isSlateElement } from './helpers'

const RenderedLeaf: React.FC<{
  leaf: CustomText
  schema: SchemaConfig
}> = ({ leaf, schema }) =>
  leaf.text ? (
    <Marks leaf={leaf} schema={schema}>
      {leaf.text}
    </Marks>
  ) : null

const RenderNodes: React.FC<{
  nodes: CustomNode[]
  schema: SchemaConfig
}> = ({ nodes, schema }) => (
  <>
    {nodes.map((node: CustomDescendant, i) =>
      isSlateElement(node) ? (
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
  const Component = schema[type]
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
  raw?: boolean
}> = ({ value, schema, raw }) => {
  const Container = raw ? Fragment : LayoutContainer
  return (
    <Container schema={schema}>
      <RenderNodes nodes={value} schema={schema} />
    </Container>
  )
}
export default SlateRender
