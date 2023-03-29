export const PropsTable = ({
  props,
}: {
  props: {
    name: string
    type: string
    defaultValue?: string
    description?: string
    required?: boolean
  }[]
}) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Type</td>
            <td>Default</td>
            <td>Description</td>
          </tr>
        </thead>
        <tbody>
          {props.map(({ name, type, defaultValue, required, description }) => {
            return (
              <tr key={name}>
                <td>
                  <code>{`${name}${required ? '' : '?'}`}</code>
                </td>
                <td>
                  <code>{type}</code>
                </td>
                <td>
                  <code>{defaultValue}</code>
                </td>
                <td>{description}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
