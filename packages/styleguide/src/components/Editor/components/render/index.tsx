import React, { PropsWithChildren } from 'react'
import { CustomDescendant, CustomElement, CustomText } from '../../custom-types'
import { config as elementsConfig } from '../elements'
import { config as mConfig, configKeys as mKeys } from '../marks'

const RenderedElement: React.FC<
  PropsWithChildren<{
    element: CustomElement
  }>
> = (props) => {
  const config = elementsConfig[props.element.type]
  const Component = config.Component
  return <Component {...props} />
}

const RenderedLeaf: React.FC<
  PropsWithChildren<{
    leaf: CustomText
  }>
> = ({ leaf, children, ...props }) => {
  const markStyles = mKeys
    .filter((mKey) => leaf[mKey])
    .reduce((acc, mKey) => {
      const mStyle = mConfig[mKey].styles
      return { ...acc, ...mStyle }
    }, {})

  return (
    <span {...markStyles} {...props}>
      {children}
    </span>
  )
}

const SlateRender: React.FC<{
  value: CustomDescendant[]
}> = ({ value }) => {
  return (
    <div>
      <pre>{JSON.stringify(value)}</pre>
    </div>
  )
}
export default SlateRender
