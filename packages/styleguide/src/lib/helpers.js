export const intersperse = (list, separator) => {
  if (list.length === 0) {
    return []
  }

  return list.slice(1).reduce(
    (items, item, i) => {
      return items.concat([separator(item, i), item])
    },
    [list[0]],
  )
}

export const rafDebounce = (fn) => {
  let next

  return (...args) => {
    if (!next) {
      next = window.requestAnimationFrame(() => {
        next = undefined
        fn(...args)
      })
    }
    return next
  }
}

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
