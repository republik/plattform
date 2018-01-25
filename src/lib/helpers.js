export const intersperse = (list, separator) => {
  if (list.length === 0) {
    return []
  }

  return list.slice(1).reduce((items, item, i) => {
    return items.concat([separator(item, i), item])
  }, [list[0]])
}

export const rafDebounce = fn => {
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
