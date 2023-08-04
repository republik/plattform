import dynamic from 'next/dynamic'
import { getCustomComponent } from './CustomComponentRegistry'
import { useAcknowledgeCTAMutation } from './graphql/useAcknowledgeCTAMutation'
import useCallToAction from './useCallToAction'

const BasicCallToAction = dynamic(() => import('./BasicCallToAction'), {
  ssr: false,
})

/**
 * Render a call to action banner that faddes in underneath the frame-haeder
 */
export default function CallToActionBanner() {
  const [handleAcknowledge] = useAcknowledgeCTAMutation()
  const { data: callToActions, loading, error } = useCallToAction()
  // Retrieve the right component based on the calltoAction.payload

  if (loading || error || !callToActions) {
    return null
  }

  return callToActions.map((callToAction) => {
    const acknowledge = () => {
      handleAcknowledge({
        variables: {
          id: callToAction.id,
          response: undefined,
        },
        optimisticResponse: {
          acknowledgeCallToAction: {
            id: callToAction.id,
            acknowledgedAt: new Date().toISOString(),
          },
        },
      })
    }

    if (callToAction.payload.__typename === 'CallToActionComponentPayload') {
      const CustomComponent = getCustomComponent(
        callToAction.payload.customComponent.key,
      )
      return CustomComponent ? (
        <CustomComponent
          key={callToAction.id}
          id={callToAction.id}
          payload={callToAction.payload}
          handleAcknowledge={acknowledge}
        />
      ) : null
    } else if (callToAction.payload.__typename === 'CallToActionBasicPayload') {
      return (
        <BasicCallToAction
          key={callToAction.id}
          id={callToAction.id}
          payload={callToAction.payload}
          handleAcknowledge={acknowledge}
        />
      )
    }
    return null
  })
}
