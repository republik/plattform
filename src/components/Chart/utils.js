import { formatLocale, formatSpecifier, precisionFixed } from 'd3-format'

export const groupBy = (array, key) => {
  const object = array.reduce(
    (o, item, index) => {
      const k = key(item, index) || ''
      o[k] = o[k] || []
      o[k].push(item)
      return o
    },
    {}
  )

  return Object.keys(object).map(k => ({
    key: k,
    values: object[k]
  }))
}

export const measure = onMeasure => {
  let ref
  let rafHandle
  const update = () => {
    onMeasure(
      ref,
      ref.getBoundingClientRect()
    )
  }
  return newRef => {
    ref = newRef
    if (ref) {
      window.addEventListener('resize', update)
      // raf needed to wait for glamor css styles
      rafHandle = window.requestAnimationFrame(update)
    } else {
      window.removeEventListener('resize', update)
      window.cancelAnimationFrame(rafHandle)
    }
  }
}

const thousandSeparator = '\u2009'
const swissNumbers = formatLocale({
  decimal: '.',
  thousands: thousandSeparator,
  grouping: [3],
  currency: ['CHF\u00a0', '']
})

const formatPow = (t, baseValue) => {
  const decimalFormat = swissNumbers.format('.0f')
  let [n] = decimalFormat(baseValue).split('.')
  let scale = value => value
  let suffix = ''
  if (n.length > 9) {
    scale = value => value / Math.pow(10, 9)
    suffix = ' Mio.'
  } else if (n.length > 6) {
    scale = value => value / Math.pow(10, 6)
    suffix = ' Mrd.'
  }
  return {
    scale,
    suffix
  }
}

const sFormat = (t, precision = 4, pow, type = 'r') => {
  const numberFormat = swissNumbers.format(',d')
  // we only round suffixed values to precision
  const numberFormatWithSuffix = swissNumbers.format(`,.${precision}${type}`)
  return value => {
    let fPow = pow || formatPow(t, value)
    if (fPow.suffix) {
      return numberFormatWithSuffix(fPow.scale(value)) + fPow.suffix
    }
    return numberFormat(fPow.scale(value))
  }
}

export const getFormat = (numberFormat, t) => {
  const specifier = formatSpecifier(numberFormat)

  if (specifier.type === 's') {
    return sFormat(t, specifier.precision)
  }
  return swissNumbers.format(specifier)
}

export const calculateAxis = (numberFormat, t, domain, unit = '') => {
  const [min, max] = domain
  const step = (max - min) / 2
  const ticks = [min, min + step, max]
  const format = swissNumbers.format

  const specifier = formatSpecifier(numberFormat)
  let formatter = getFormat(numberFormat, t)
  let regularFormat
  let lastFormat
  if (specifier.type === '%') {
    let fullStep = +(step * 100).toFixed(specifier.precision)
    let fullMax = +(max * 100).toFixed(specifier.precision)
    specifier.precision = precisionFixed((fullStep - Math.floor(fullStep)) || (fullMax - Math.floor(fullMax)))
    lastFormat = format(specifier.toString())
    specifier.type = 'f'
    const regularFormatInner = format(specifier.toString())
    regularFormat = (value) => regularFormatInner(value * 100)
  } else if (specifier.type === 's') {
    let pow = formatPow(t, min + step)
    let scaledStep = pow.scale(step)
    let scaledMax = pow.scale(max)
    specifier.precision = precisionFixed((scaledStep - Math.floor(scaledStep)) || (scaledMax - Math.floor(scaledMax)))

    lastFormat = sFormat(t, specifier.precision, pow, 'f')
    regularFormat = sFormat(t, specifier.precision, {scale: pow.scale, suffix: ''}, 'f')
  } else {
    specifier.precision = precisionFixed((step - Math.floor(step)) || (max - Math.floor(max)))
    lastFormat = regularFormat = format(specifier.toString())
  }
  const axisFormat = (value, isLast) => isLast ? `${lastFormat(value)} ${unit}` : regularFormat(value)

  return {
    ticks,
    format: formatter,
    axisFormat
  }
}
