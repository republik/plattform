import { test, expect } from '@playwright/test'

const DYNAMIC_COMPONENT_PAGES = [
  '/2020/01/22/das-grosse-wef-quiz',
  '/2020/03/02/so-ist-er-wirklich-der-auslaender',
  '/2021/03/01/ein-jahr-pandemie-im-interaktiven-rueckblick',
]

for (const path of DYNAMIC_COMPONENT_PAGES) {
  test(`dynamic component screenshot ${path}`, async ({ page }) => {
    await page.goto(path)
    const dc = page.getByTestId('DYNAMIC_COMPONENT')
    for (const d of await dc.all()) {
      await expect(d).toHaveScreenshot({
        maxDiffPixelRatio: 0.05,
      })
    }
  })
}
