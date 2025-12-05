import { useIpAllowlist } from 'lib/context/IpAllowlistContext'
import { useMe } from 'lib/context/MeContext'

export function IpAllowlistBanner() {
  const { allowlistName, hasAllowlistAccess } = useIpAllowlist()
  const { isMember } = useMe()
  
  // Only show banner for users without allowlist access
  if (!hasAllowlistAccess || isMember) {
    return null
  }
  
  return (
    <div
      style={{
        padding: '8px 16px',
        backgroundColor: '#000000',
        color: 'white',
        textAlign: 'center',
        fontSize: '12px',
      }}
    >
      Zugang über {allowlistName}
    </div>
  )
}

