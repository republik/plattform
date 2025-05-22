import { useRouter } from 'next/router'
import {
  PUBLIC_BASE_URL,
  SCREENSHOT_SERVER_BASE_URL,
} from '../../../../lib/constants'
import Meta from '../../../Frame/Meta'

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
        image: `${SCREENSHOT_SERVER_BASE_URL}/api/screenshot?width=1200&url=${encodeURIComponent(
          shareImageUrl,
        )}`,
      }}
    />
  )
}

export default QuestionnaireMeta
