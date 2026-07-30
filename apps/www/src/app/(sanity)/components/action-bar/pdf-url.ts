import { PUBLIC_BASE_URL, SCREENSHOT_SERVER_BASE_URL } from '@/lib/constants'

/**
 * The PDF is not a stored asset — a screenshot server renders it from the
 * public URL on demand.
 *
 * Deliberately not reusing `getPdfUrl` from the Pages-Router `PdfOverlay.js`:
 * that module drags `@project-r/styleguide` overlays into the bundle, and it
 * joins the path as `${PUBLIC_BASE_URL}/${path}`, which double-slashes for the
 * leading-slash paths this route uses.
 */
export function getArticlePdfUrl({
  path,
  version,
}: {
  path: string
  version?: string
}): string {
  const pdfUrl = new URL('/api/pdf', SCREENSHOT_SERVER_BASE_URL)
  pdfUrl.searchParams.set('url', new URL(path, PUBLIC_BASE_URL).toString())
  if (version) {
    pdfUrl.searchParams.set('version', version)
  }
  pdfUrl.searchParams.set('images', 'true')
  pdfUrl.searchParams.set('format', 'A4')
  return pdfUrl.toString()
}
