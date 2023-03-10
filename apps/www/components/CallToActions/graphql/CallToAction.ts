export type CallToAction = {
  id: string
  beginAt: string
  endAt?: string
  acknowlegedAt?: string
  updatedAt: string
  createdAt: string
  payload: {
    customComponent: string
  }
  response?: unknown
}
