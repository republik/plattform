import { useRouter } from 'next/router'
import Meta from '../../../Frame/Meta'
import {
  ASSETS_SERVER_BASE_URL,
  PUBLIC_BASE_URL,
} from '../../../../lib/constants'

const QuestionnaireMeta = ({ share, shareText }) => {
  const router = useRouter()
  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('extract', share.extract)
  const shareImageUrl = shareImageUrlObj.toString()

  return (
    <Meta
      data={{
        url,
        title: shareText,
        description: share.description,
        image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
          shareImageUrl,
        )}`,
      }}
    />
  )
}

export default QuestionnaireMeta
