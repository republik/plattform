const specs = [
  { n: 60, key: 'timeduration/seconds' },
  { n: 60, key: 'timeduration/minutes' },
  { n: 24, key: 'timeduration/hours' },
  { n: 7, key: 'timeduration/days' },
  { n: 365 / 7, key: 'timeduration/weeks' },
  { n: 52, key: 'timeduration/years' },
]

// diff is in seconds, positive.
export default (t, diff) => {
  let i = 0
  for (; i < specs.length && diff >= specs[i].n; i++) {
    diff /= specs[i].n
  }

  const spec = specs[Math.min(i, specs.length - 1)]
  return t(spec.key, {
    count: Math[spec.fn || 'floor'](diff),
  })
}
