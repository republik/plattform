import httpProxy from 'http-proxy'

const API_URL = 'https://api.republik.love/graphql' // The actual URL of your API

const proxy = httpProxy.createProxyServer()

proxy.on('proxyRes', (proxyRes) => {
  proxyRes.headers['set-cookie'] = (proxyRes.headers['set-cookie'] || [])
    .map((header) => header.replace('; Secure', ''))
    .map((header) => header.replace('; SameSite=None', '; SameSite=Lax'))
})

proxy.on('proxyReq', (proxyReq, req, res) => {
  req.headers['set-cookie'] = (req.headers['set-cookie'] || [])
    .map((header) => header + '; Secure')
    .map((header) => header.replace('; SameSite=Lax', '; SameSite=None'))
})

// Make sure that we don't parse JSON bodies on this route:
export const config = {
  api: {
    bodyParser: false,
  },
}

export default (req, res) => {
  console.log(req)
  return new Promise((resolve, reject) => {
    proxy.web(
      req,
      res,
      {
        target: API_URL,
        changeOrigin: true,
        cookieDomainRewrite: { '*': 'localhost' },
      },
      (err) => {
        if (err) {
          console.error('Whoops, something went wrong with proxying')
          return reject(err)
        }
        resolve(null)
      },
    )
  })
}
