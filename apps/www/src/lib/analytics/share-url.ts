export function addShareUtmParams(url: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('utm_source', 'republik')
    urlObj.searchParams.set('utm_medium', 'share')
    return urlObj.toString()
  } catch {
    return url
  }
}
