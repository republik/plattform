import { useInNativeApp } from 'lib/withInNativeApp'

function IosCTA() {
  const { isMinimalNativeAppVersion } = useInNativeApp()
  const canUseLinkCta = isMinimalNativeAppVersion('2.3.0')

  if (canUseLinkCta) {
    return (
      <div>
        <p>Lorem ipsum</p>
      </div>
    )
  }

  return <p>Et selpulchrum</p>
}

export default IosCTA
