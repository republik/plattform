import React, { ReactNode } from 'react'
import {
  CustomDescendant,
  CustomElement,
  CustomElementsType,
  CustomNode,
  CustomText,
  SchemaConfig,
} from '../custom-types'
import { Marks } from './Mark'
import { LayoutContainer } from './Containers'
import { isSlateElement } from './helpers'

export const SkipElement: React.FC<{ children?: ReactNode }> = ({
  children,
}) => <>{children}</>

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
  skip?: CustomElementsType[]
}> = ({ nodes, schema, skip }) => (
  <>
    {nodes.map((node: CustomDescendant, i) =>
      isSlateElement(node) ? (
        <RenderedElement element={node} schema={schema} skip={skip} key={i} />
      ) : (
        <RenderedLeaf leaf={node} schema={schema} key={i} />
      ),
    )}
  </>
)

export const RenderedElement: React.FC<{
  element: CustomElement
  schema: SchemaConfig
  skip?: CustomElementsType[]
}> = ({ element, schema, skip }) => {
  const { type, children, ...customElProps } = element
  if (skip && skip.includes(type)) return null
  const Component = schema[type]
  // console.log({ type })
  if (!Component) {
    console.warn('Component for', element.type, 'missing')
    return null
  }
  return (
    <Component {...customElProps}>
      <RenderNodes nodes={children} schema={schema} skip={skip} />
    </Component>
  )
}

const SlateRender: React.FC<{
  value: CustomDescendant[]
  schema: SchemaConfig
  raw?: boolean
  skip?: CustomElementsType[]
}> = ({ value, schema, raw, skip }) => {
  const Container = raw ? (props) => <div {...props} /> : LayoutContainer
  return (
    <Container schema={schema}>
      <RenderNodes nodes={value} schema={schema} skip={skip} />
    </Container>
  )
}
export default SlateRender
