import { useMemo } from 'react'
import { CATComponentBaseProps } from './CustomComponentBase'
import { getCustomComponent } from './CustomComponentRegistry'
import { useAcknowledgeCTAMutation } from './graphql/useAcknowledgeCTAMutation'
import useCallToAction from './useCallToAction'

/**
 * Render a call to action banner that faddes in underneath the frame-haeder
 */
export default function CallToActionBanner() {
  const [handleAcknowledge] = useAcknowledgeCTAMutation()
  const { data: callToAction, loading, error } = useCallToAction()
  // Retrieve the right component based on the calltoAction.payload

  const Component: React.ComponentType<CATComponentBaseProps> = useMemo(() => {
    if (!callToAction) {
      return null
    }

    if (callToAction.payload.customComponent) {
      return getCustomComponent(callToAction.payload.customComponent.key)
    }

    return null // TODO: Implement default component
  }, [callToAction?.id, callToAction?.payload.customComponent])

  if (loading || error || !callToAction || !Component) {
    return null
  }

  return (
    <Component
      callToAction={callToAction}
      handleAcknowledge={async () => {
        handleAcknowledge({
          variables: {
            id: callToAction.id,
            response: undefined,
          },
          optimisticResponse: {
            acknowledgeCallToAction: {
              ...callToAction,
              acknowledgedAt: new Date().toISOString(),
              response: null,
            },
          },
        })
      }}
    />
  )
}
