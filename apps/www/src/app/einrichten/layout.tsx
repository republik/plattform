import { EventTrackingContext } from '@app/lib/analytics/event-tracking'

export default function OnboardingLayout({ children }) {
  return (
    <EventTrackingContext category='Onboarding'>
      {children}
    </EventTrackingContext>
  )
}
