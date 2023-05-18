import { createProxyMiddleware } from 'http-proxy-middleware'
import { PUBLIC_BASE_URL } from '../../../lib/constants'

const publicHostname = PUBLIC_BASE_URL
  ? new URL(PUBLIC_BASE_URL).hostname
  : 'localhost'

const proxy = createProxyMiddleware({
  target: process.env.PROXY_API_URL,
  changeOrigin: true,
  onProxyRes: (proxyRes) => {
    // Don't use secure cookie on local domains
    if (publicHostname.match(/(localhost|\.local)$/)) {
      proxyRes.headers['set-cookie'] = (proxyRes.headers['set-cookie'] || [])
        .map((header) => header.replace('; Secure', ''))
        .map((header) => header.replace('; SameSite=None', '; SameSite=Lax'))
    }
  },
  cookieDomainRewrite: {
    '*': publicHostname,
  },
})

// Make sure that we don't parse JSON bodies on this route:
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
}

export default (req, res) => {
  proxy(req, res, (err) => {
    if (err) {
      throw err
    }
  })
}
