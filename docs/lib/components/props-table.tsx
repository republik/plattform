import { useMDXComponents } from 'nextra-theme-docs'

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
  const mdx = useMDXComponents()

  return (
    <mdx.table>
      <thead>
        <mdx.tr>
          <mdx.th align='left'>Name</mdx.th>
          <mdx.th align='left'>Type</mdx.th>
          <mdx.th align='left'>Default</mdx.th>
          <mdx.th align='left'>Description</mdx.th>
        </mdx.tr>
      </thead>
      <tbody>
        {props.map(({ name, type, defaultValue, required, description }) => {
          return (
            <mdx.tr key={name}>
              <mdx.td>
                <mdx.code>{`${name}${required ? '' : '?'}`}</mdx.code>
              </mdx.td>
              <mdx.td>
                <mdx.code style={{ whiteSpace: 'nowrap' }}>{type}</mdx.code>
              </mdx.td>
              <mdx.td>
                {defaultValue ? <mdx.code>{defaultValue}</mdx.code> : '–'}
              </mdx.td>
              <mdx.td>{description}</mdx.td>
            </mdx.tr>
          )
        })}
      </tbody>
    </mdx.table>
  )
}
