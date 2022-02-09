const specs = [
  { n: 60, key: 'timeago/justNow' },
  { n: 60, key: 'timeago/minutes' },
  { n: 24, key: 'timeago/hours' },
  { n: 7, key: 'timeago/days' },
  { n: 365 / 7 / 12, key: 'timeago/weeks' },
  { n: 12, key: 'timeago/months', fn: 'round' },
  { n: 1, key: 'timeago/years' },
]

// diff is in seconds, positive.
export default (t, diff) => {
  let i = 0
  for (; i < specs.length && diff >= specs[i].n; i++) {
    diff /= specs[i].n
  }

  const spec = specs[Math.min(i, specs.length - 1)]
  return t.pluralize(spec.key, {
    count: Math[spec.fn || 'floor'](diff),
  })
}
