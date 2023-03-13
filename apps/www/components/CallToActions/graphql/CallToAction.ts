export type CallToAction = {
  id: string
  beginAt: string
  endAt?: string
  acknowlegedAt?: string
  updatedAt: string
  createdAt: string
  payload: {
    customComponent: {
      key: string
      args?: {
        [key: string]: unknown
      }
    }
  }
  response?: unknown
}
