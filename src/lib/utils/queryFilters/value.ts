export interface ValueFilter {
  value: any
}

export const fromString = (
  parser: ((value?: string) => any)
) => (str: string): ValueFilter => ({
  value: parser(str)
})

export const toString = (
  serializer: ((value?: any) => string)
) => ({ value }: ValueFilter): string => serializer(value)
