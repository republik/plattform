import { MagazineSubscriptionStatus } from '#graphql/republik-api/__generated__/gql/graphql'

const startWithCapitalLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

interface Color {
  light: string
  dark: string
}

const successColoring: Color = {
  light: '#E6FFEC',
  dark: '#34D399',
}

const errorColoring: Color = {
  light: '#FFEEEE',
  dark: '#EF4444',
}

const warningColoring: Color = {
  light: '#FFFAF0',
  dark: '#F59E0B',
}

const infoColoring: Color = {
  light: '#EFF6FF',
  dark: '#3B82F6',
}

interface SubscriptionStatusBadgeProps {
  status: MagazineSubscriptionStatus
}

const colorMapping: Record<MagazineSubscriptionStatus, Color> = {
  canceled: infoColoring,
  ended: infoColoring,
  paused: infoColoring,
  active: successColoring,
  trailing: successColoring,
  incomplete: warningColoring,
  incomplete_expired: warningColoring,
  overdue: errorColoring,
  past_due: errorColoring,
  unpaid: errorColoring,
}

export default function SubscriptionStatusBadge(
  props: SubscriptionStatusBadgeProps,
) {
  const color = colorMapping[props.status]

  return (
    <span
      style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        backgroundColor: color.light,
        color: color.dark,
        border: `1px solid ${color.dark}`,
        textTransform: 'capitalize',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {startWithCapitalLetter(props.status.replaceAll('_', ' '))}
    </span>
  )
}
