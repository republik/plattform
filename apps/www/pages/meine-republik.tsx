import { useRouter } from 'next/router'
import Frame from '../components/Frame'
import UserNav from '../components/Frame/Popover/UserNav'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { useMe } from '../lib/context/MeContext'
import { useEffect } from 'react'

function MeineRepublikPage() {
  const { me } = useMe()
  const router = useRouter()

  useEffect(() => {
    if (!me) {
      router.push('/anmelden')
    }
  }, [me?.id])

  return (
    <Frame raw pullable={false}>
      <UserNav me={me} router={router} />
    </Frame>
  )
}

export default withDefaultSSR(MeineRepublikPage)
