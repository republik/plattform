const puppeteer = require('puppeteer-core')
const chrome = require('chrome-aws-lambda')
const { parse } = require('url')
const debug = require('debug')('screenshot')

const { URL_ALLOWLIST } = process.env

const DEFAULT_WIDTH = 1200
const DEFAULT_HEIGHT = 1
const DEFAULT_SCALE_FACTOR = 1
const FORMATS = ['png', 'jpeg']

if (!URL_ALLOWLIST) {
  console.warn('missing env URL_ALLOWLIST, the /render endpoint will not work')
}
const allowlistedUrls = URL_ALLOWLIST && URL_ALLOWLIST.split(',')

const getPosInt = (number) => Math.ceil(Math.abs(number))

// returns buffer
module.exports = async (req, res) => {
  const {
    query: {
      url,
      width,
      height,
      zoomFactor,
      fullPage = '1',
      format: _format,
      quality,
      cookie,
      basicAuthUser,
      basicAuthPass,
    },
  } = parse(req.url, true)

  const format = _format && FORMATS.indexOf(_format) !== -1 ? _format : 'png'

  debug({
    url,
    width,
    height,
    zoomFactor,
    fullPage,
    format,
    quality,
    cookie,
    basicAuthUser,
  })

  if (!url) {
    res.statusCode = 400
    return res.end('missing url param')
  }

  const allowed =
    (URL_ALLOWLIST && URL_ALLOWLIST === 'all') ||
    (allowlistedUrls &&
      !!allowlistedUrls.find((allowUrl) => url.indexOf(allowUrl) === 0))

  if (!allowed) {
    console.warn('forbidden render url requested: ' + url)
    res.statusCode = 403
    return res.end()
  }

  let browser
  try {
    const options = process.env.AWS_REGION
      ? {
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
        }
      : {
          args: [],
          executablePath:
            process.platform === 'win32'
              ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
              : process.platform === 'linux'
              ? '/usr/bin/google-chrome'
              : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        }
    const browser = await puppeteer.launch(options)

    const page = await browser.newPage()

    const promises = [
      page.setViewport({
        width: getPosInt(width) || DEFAULT_WIDTH,
        height: getPosInt(height) || DEFAULT_HEIGHT,
        deviceScaleFactor: Math.abs(zoomFactor) || DEFAULT_SCALE_FACTOR,
      }),
      page.setExtraHTTPHeaders({ DNT: '1' }),
    ]

    if (cookie) {
      const [name, value] = cookie.split('=')
      promises.push(page.setCookie({ name, value, url }))
    }

    await Promise.all(promises)

    if (basicAuthUser) {
      await page.authenticate({
        username: basicAuthUser,
        password: basicAuthPass,
      })
    }

    await page.goto(url)

    const screenshot = await page.screenshot({
      fullPage: Boolean(parseInt(fullPage)).valueOf(),
      type: format,
      ...(quality !== undefined ? { quality: getPosInt(quality) } : {}),
    })

    res.statusCode = 200
    res.setHeader('Content-Type', `image/${format}`)
    res.end(screenshot)
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    res.end(error.message || error)
  } finally {
    if (browser) {
      await browser.close().catch((error) => console.warn(error))
    }
  }
}
