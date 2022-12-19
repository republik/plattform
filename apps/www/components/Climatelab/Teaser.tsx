import { useMe } from '../../lib/context/MeContext'

const ClimatelabTeaser = () => {
  const { me } = useMe()
  return (
    <div style={{ background: 'yellow', color: 'navy' }}>
      Die Lage ist ernst, {me?.username}!
    </div>
  )
}

export default ClimatelabTeaser
