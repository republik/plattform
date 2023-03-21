export type CallToAction = {
  id: string
  beginAt: string
  endAt?: string
  acknowledgedAt?: string
  updatedAt: string
  createdAt: string
  payload: {
    customComponent: {
      key: string
      args?: Record<string, unknown>
    }
  }
  response?: unknown
}
