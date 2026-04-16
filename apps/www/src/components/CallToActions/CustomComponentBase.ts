import { CallToAction } from './graphql/CallToAction'

/**
 * BaseProps for all CTA-Components
 */
export type CTAComponentBaseProps<R = unknown> = {
  id: string
  payload: {
    customComponent: {
      key: string
      args?: Record<string, unknown>
    }
  }
  handleAcknowledge: (response?: R) => void
}
