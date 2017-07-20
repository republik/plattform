export interface RangeFilter {
  from?: any
  to?: any
}

export const fromString = (
  parser: ((value?: string) => any)
) => (str: string): RangeFilter => {
  const [from, to] = str.split(':')
  return { from: parser(from), to: parser(to) }
}

export const toString = (
  serializer: ((value?: any) => string)
) => ({ from, to }: RangeFilter): string => {
  return `${serializer(from)}: ${serializer(to)}`
}
