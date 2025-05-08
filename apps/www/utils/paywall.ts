export function trackArticleRead(articleId: string) {
  const articlesRead = JSON.parse(localStorage.getItem('articlesRead') || '[]')
  if (!articlesRead.includes(articleId)) {
    articlesRead.push(articleId)
    localStorage.setItem('articlesRead', JSON.stringify(articlesRead))
  }
}

export function hasExceededThreshold(threshold: number): boolean {
  const articlesRead = JSON.parse(localStorage.getItem('articlesRead') || '[]')
  return articlesRead.length > threshold
}
