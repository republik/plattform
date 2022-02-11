const specs = [
  { n: 60, key: 'timeAhead/justNow' },
  { n: 60, key: 'timeAhead/minutes' },
  { n: 24, key: 'timeAhead/hours' },
  { n: 7, key: 'timeAhead/days' },
  { n: 365 / 7 / 12, key: 'timeAhead/weeks' },
  { n: 12, key: 'timeAhead/months', fn: 'round' },
  { n: 1, key: 'timeAhead/years' },
]

// diff is in seconds.
export default (t, diff) => {
  diff = Math.abs(diff)
  let i = 0
  for (; i < specs.length && diff >= specs[i].n; i++) {
    diff /= specs[i].n
  }

  const spec = specs[Math.min(i, specs.length - 1)]
  return t.pluralize(spec.key, {
    count: Math[spec.fn || 'floor'](diff),
  })
}
