declare module '*?props' {
  const propDeclarations: Record<
    string,
    {
      name: string
      type: string
      description: string
      defaultValue?: string
      required: boolean
    }[]
  >
  export default propDeclarations
}
