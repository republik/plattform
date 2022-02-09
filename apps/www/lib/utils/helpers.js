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

export const getElementFromSeed = (list = [], seed) => {
  return list[Math.floor(list.length * seed)]
}

export const deduplicate = (d, i, all) => all.indexOf(d) === i
