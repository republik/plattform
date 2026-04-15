export function trackArticleRead(articleId: string) {
  try {
    const articlesRead = JSON.parse(
      localStorage.getItem('articlesRead') || '[]',
    )
    if (!articlesRead.includes(articleId)) {
      articlesRead.push(articleId)
      localStorage.setItem('articlesRead', JSON.stringify(articlesRead))
    }
  } catch {}
}

export function hasExceededThreshold(threshold: number): boolean {
  try {
    const articlesRead = JSON.parse(
      localStorage.getItem('articlesRead') || '[]',
    )
    return articlesRead.length > threshold
  } catch {
    return false
  }
}
