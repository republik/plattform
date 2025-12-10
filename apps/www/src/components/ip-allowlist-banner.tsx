import { useIpAllowlist } from 'lib/context/IpAllowlistContext'
import { useMe } from 'lib/context/MeContext'

export function IpAllowlistBanner() {
  const { allowlistName, hasAllowlistAccess } = useIpAllowlist()
  const { isMember } = useMe()

  // Don't show banner for users with member access or without allowlist access
  if (!hasAllowlistAccess || isMember) {
    return null
  }

  return (
    <div
      style={{
        padding: '8px 16px',
        backgroundColor: '#000000',
        color: 'white',
        fontSize: '12px',
      }}
    >
      Offener Zugang via {allowlistName}
    </div>
  )
}
