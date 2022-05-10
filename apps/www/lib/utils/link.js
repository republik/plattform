export const shouldIgnoreClick = (event, ignoreTarget) => {
  // based on https://github.com/zeit/next.js/blob/82d56e063aad12ac8fee5b9d5ed24ccf725b1a5b/packages/next-server/lib/link.js#L59
  const anchor = [event.target, event.currentTarget].find(
    (node) => node.nodeName === 'A',
  )
  return (
    !!anchor &&
    !!(
      (!ignoreTarget && anchor.target && anchor.target !== '_self') ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      (event.nativeEvent && event.nativeEvent.which === 2)
    )
  )
}

export const removeQuery = (url = '') => url.split('?')[0]

export const cleanAsPath = (asPath) => removeQuery(asPath).split('#')[0]

export const scrollTop = () => window.scrollTo(0, 0)
