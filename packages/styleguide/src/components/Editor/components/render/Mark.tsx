import React from 'react'
import { CustomText, SchemaConfig } from '../../custom-types'
import { config as mConfig, configKeys as mKeys } from '../../config/marks'

const Recurse: React.FC<{
  components?: React.FC[]
}> = ({ children, components = [] }) => {
  if (!components.length) {
    return <>{children}</>
  }
  const [Component, ...rest] = components
  return (
    <Recurse components={rest}>
      <Component>{children}</Component>
    </Recurse>
  )
}

export const Marks: React.FC<{
  leaf: CustomText
  schema: SchemaConfig
}> = ({ children, leaf, schema }) => {
  const mComponents = mKeys
    .filter((mKey) => leaf[mKey])
    .map((mKey) => schema[mConfig[mKey].component])
  return <Recurse components={mComponents}>{children}</Recurse>
}
