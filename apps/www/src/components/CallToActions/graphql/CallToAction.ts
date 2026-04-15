export type CallToAction = {
  id: string
  beginAt: string
  endAt?: string
  acknowledgedAt?: string
  updatedAt: string
  createdAt: string
  payload:
    | {
        __typename: 'CallToActionBasicPayload'
        text: string
        linkHref: string
        linkLabel: string
        backgroundColor?: string
        textColor?: string
        illustration?: string
      }
    | {
        __typename: 'CallToActionComponentPayload'
        customComponent: {
          key: string
          args?: Record<string, unknown>
        }
      }
  response?: unknown
}
