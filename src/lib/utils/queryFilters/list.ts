export interface ListFilter {
  values: any[]
}

export const fromString = (
  parser: ((value?: string) => any)
) => (str: string): ListFilter => ({
  values: str.split(',').map(parser)
})

export const toString = (
  serializer: ((value?: any) => string)
) => ({ values }: ListFilter): string =>
  values.map(serializer).join(',')
