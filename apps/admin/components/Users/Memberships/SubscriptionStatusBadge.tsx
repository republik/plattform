import { MagazineSubscriptionStatus } from '#graphql/republik-api/__generated__/gql/graphql'
import { useTranslation } from 'lib/useT'

interface Color {
  background: string
  foreground: string
}

const successColoring: Color = {
  background: '#00AA00',
  foreground: '#ffffff',
}

const errorColoring: Color = {
  background: '#dc2626',
  foreground: '#fff',
}

const warningColoring: Color = {
  background: '#F59E0B',
  foreground: '#fff',
}

const infoColoring: Color = {
  background: '#3B82F6',
  foreground: '#fff',
}

interface SubscriptionStatusBadgeProps {
  status: MagazineSubscriptionStatus
}

const colorMapping: Record<MagazineSubscriptionStatus, Color> = {
  canceled: infoColoring,
  paused: infoColoring,
  active: successColoring,
  trialing: successColoring,
  incomplete: warningColoring,
  incomplete_expired: warningColoring,
  past_due: errorColoring,
  unpaid: errorColoring,
}

export default function SubscriptionStatusBadge(
  props: SubscriptionStatusBadgeProps,
) {
  const color = colorMapping[props.status]

  const { t } = useTranslation()

  return (
    <span
      style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        backgroundColor: color.background,
        color: color.foreground,
        textTransform: 'capitalize',
        fontSize: '0.75rem',
        fontWeight: '500',
      }}
    >
      {t(`account/MagazineSubscription/status/${props.status}`)}
    </span>
  )
}
