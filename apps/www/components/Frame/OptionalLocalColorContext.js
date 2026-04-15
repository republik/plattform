import { ColorContextLocalExtension } from '@project-r/styleguide'

const OptionalLocalColorContext = ({ children, ...props }) => {
  if (props.localColorVariables) {
    return (
      <ColorContextLocalExtension localColors={props.localColorVariables}>
        {children}
      </ColorContextLocalExtension>
    )
  }
  return <>{children}</>
}

export default OptionalLocalColorContext
