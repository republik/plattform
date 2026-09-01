import type { PortableTextComponentProps, UnknownNodeType } from 'next-sanity'

export function UnknownType({
  value,
  isInline,
}: PortableTextComponentProps<UnknownNodeType>) {
  return (
    <span
      style={
        isInline
          ? { background: 'hotpink' }
          : {
              background: 'hotpink',
              display: 'block',
              padding: 30,
              overflowWrap: 'anywhere',
            }
      }
    >
      {JSON.stringify(value, null, 2)}
    </span>
  )
}
