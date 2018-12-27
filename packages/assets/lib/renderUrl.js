const puppeteer = require('puppeteer')

const {
  PUPPETEER_WS_ENDPOINT,
  FRONTEND_BASIC_AUTH_USER,
  FRONTEND_BASIC_AUTH_PASS,
  RENDER_COOKIE
} = process.env

// returns buffer
module.exports = async (url, width, height, zoomFactor) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: PUPPETEER_WS_ENDPOINT
  })

  const page = await browser.newPage()

  let promises = []

  promises.push(
    page.setExtraHTTPHeaders({ 'DNT': '1' })
  )

  if (width !== undefined && height !== undefined) {
    promises.push(
      page.setViewport({
        width,
        height,
        deviceScaleFactor: zoomFactor
      })
    )
  }

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
    fullPage: true
  })

  browser.close()

  return screenshot
}
