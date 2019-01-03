const puppeteer = require('puppeteer')
const chromium = require('chrome-aws-lambda')

const {
  PUPPETEER_WS_ENDPOINT,
  FRONTEND_BASIC_AUTH_USER,
  FRONTEND_BASIC_AUTH_PASS,
  RENDER_COOKIE
} = process.env

// returns buffer
module.exports = async (
  url,
  width,
  height,
  zoomFactor,
  fullPage = true
) => {
  let browser
  if (chromium.headless) {
    console.log('rendering with local headless chrome')
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    })
  } else {
    if (!PUPPETEER_WS_ENDPOINT) {
      console.warn('missing env PUPPETEER_WS_ENDPOINT, cannot render')
      return
    }
    console.log('rendering with external chrome')
    browser = await puppeteer.connect({
      browserWSEndpoint: PUPPETEER_WS_ENDPOINT
    })
  }

  const page = await browser.newPage()

  const promises = [
    page.setViewport({
      width: Math.ceil(Math.abs(width)) || 1200,
      height: Math.ceil(Math.abs(height)) || 1,
      deviceScaleFactor: Math.abs(zoomFactor) || 1
    }),
    page.setExtraHTTPHeaders({ 'DNT': '1' })
  ]

  if (RENDER_COOKIE) {
    const [name, value] = RENDER_COOKIE.split('=')
    promises.push(
      page.setCookie({ name, value, url })
    )
  }

  await Promise.all(promises)

  await page.goto(url)

  if (FRONTEND_BASIC_AUTH_USER) {
    await page.authenticate({
      username: FRONTEND_BASIC_AUTH_USER,
      password: FRONTEND_BASIC_AUTH_PASS
    })
  }

  const screenshot = await page.screenshot({
    fullPage: !(['false', '0'].includes(fullPage))
  })

  browser.close()

  return screenshot
}
