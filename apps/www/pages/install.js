import Frame from '../components/Frame'
import StatusError from '../components/StatusError'

import { createGetServerSideProps } from '../lib/apollo/helpers'
import {
  matchAndroidUserAgent,
  matchIOSUserAgent,
} from '../lib/context/UserAgentContext'
import { getNativeAppVersion } from '../lib/withInNativeApp'

const InstallNativeAppPage = ({ clientRedirection }) => (
  <Frame raw>
    <StatusError status={404} clientRedirection={clientRedirection} />
  </Frame>
)

export default InstallNativeAppPage

const getQueryString = (req) => {
  const queryString = req.url.split('?')[1]
  return queryString ? `?${queryString}` : ''
}

export const getServerSideProps = createGetServerSideProps(
  async ({ ctx: { req } }) => {
    const userAgentValue = req.headers['user-agent']

    const inNativeApp = !!getNativeAppVersion(userAgentValue)
    if (inNativeApp) {
      return {
        redirect: {
          destination: `/${getQueryString(req)}`,
          permanent: false,
        },
      }
    }

    const isIOS = matchIOSUserAgent(userAgentValue)
    const isAndroid = matchAndroidUserAgent(userAgentValue)
    if (!isIOS && !isAndroid) {
      return {
        redirect: {
          destination: `/probelesen${getQueryString(req)}`,
          permanent: false,
        },
      }
    }

    return {
      props: {
        clientRedirection: {
          target: isIOS
            ? 'https://apps.apple.com/ch/app/republik/id1392772910'
            : isAndroid
            ? 'https://play.google.com/store/apps/details?id=app.republik'
            : '/probelesen',
          postExternalTarget: '/probelesen',
        },
      },
    }
  },
)
