import { CallToAction } from './graphql/CallToAction'

/**
 * BaseProps for all CTA-Components
 */
export type CATComponentBaseProps<R = unknown> = {
  callToAction: CallToAction
  handleAcknowledge: (response?: R) => void
}
