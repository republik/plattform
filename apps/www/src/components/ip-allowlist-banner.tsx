import { useIpAllowlist } from 'lib/context/IpAllowlistContext'
import { useMe } from 'lib/context/MeContext'

export function IpAllowlistBanner() {
  const { allowlistName, hasAllowlistAccess } = useIpAllowlist()
  const { me } = useMe()
  
  // Only show banner for anonymous users with allowlist access
  if (!hasAllowlistAccess || me) {
    return null
  }
  
  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #e0e0e0',
        textAlign: 'center',
        fontSize: '14px',
        color: '#333',
      }}
    >
      Zugang über {allowlistName}
    </div>
  )
}

