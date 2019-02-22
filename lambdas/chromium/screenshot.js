const puppeteer = require('puppeteer-core')
const chromium = require('chrome-aws-lambda')
const { parse } = require('url')
const debug = require('debug')('screenshot')

const {
  URL_WHITELIST,
  PUPPETEER_WS_ENDPOINT
} = process.env

const DEFAULT_WIDTH = 1200
const DEFAULT_HEIGHT = 1
const DEFAULT_SCALE_FACTOR = 1

if (!URL_WHITELIST) {
  console.warn('missing env URL_WHITELIST, the /render endpoint will not work')
}
const whitelistedUrls = URL_WHITELIST && URL_WHITELIST.split(',')

const getBrowser = async () => {
  if (chromium.headless) {
    debug('rendering with local headless chrome')
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    })
  } else {
    if (!PUPPETEER_WS_ENDPOINT) {
      console.warn('missing env PUPPETEER_WS_ENDPOINT, cannot render')
      return
    }
    debug(`rendering with chromium @ PUPPETEER_WS_ENDPOINT`)
    return puppeteer.connect({
      browserWSEndpoint: PUPPETEER_WS_ENDPOINT
    })
  }
}

const getPosInt = (number) =>
  Math.ceil(Math.abs(number))

// returns buffer
module.exports = async (req, res) => {
  const {
    query: {
      url,
      width,
      height,
      zoomFactor,
      fullPage = true,
      type = 'png',
      quality,
      cookie,
      basicAuthUser,
      basicAuthPass
    }
  } = parse(req.url, true)
  debug({ url, width, height, zoomFactor, fullPage, type, quality, cookie, basicAuthUser, basicAuthPass })

  if (!url) {
    res.statusCode = 422
    return res.end('missing url param')
  }

  const allowed =
    (URL_WHITELIST && URL_WHITELIST === 'all') ||
    (whitelistedUrls && !!whitelistedUrls.find(whiteUrl => url.indexOf(whiteUrl) === 0))

  if (!allowed) {
    console.warn('forbidden render url requested: ' + url)
    res.statusCode = 403
    return res.end()
  }

  try {
    const browser = await getBrowser()

    const page = await browser.newPage()

    const promises = [
      page.setViewport({
        width: getPosInt(width) || DEFAULT_WIDTH,
        height: getPosInt(height) || DEFAULT_HEIGHT,
        deviceScaleFactor: Math.abs(zoomFactor) || DEFAULT_SCALE_FACTOR
      }),
      page.setExtraHTTPHeaders({ 'DNT': '1' })
    ]

    if (cookie) {
      const [name, value] = cookie.split('=')
      promises.push(
        page.setCookie({ name, value, url })
      )
    }

    await Promise.all(promises)

    await page.goto(url)

    if (basicAuthUser) {
      await page.authenticate({
        username: basicAuthUser,
        password: basicAuthPass
      })
    }

    const screenshot = await page.screenshot({
      fullPage: !(['false', '0'].includes(fullPage)),
      type,
      ...quality !== undefined
        ? { quality: getPosInt(quality) }
        : {}
    })

    browser.close()

    res.statusCode = 200
    res.setHeader('Content-Type', `image/${type}`)
    return res.end(screenshot)
  } catch (error) {
    res.statusCode = 500
    return res.end(error.message || error)
  }
}
