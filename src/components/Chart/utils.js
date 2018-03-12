import { formatLocale, formatSpecifier, precisionFixed } from 'd3-format'
import { ascending, descending, max as d3Max } from 'd3-array'
import { createElement } from 'react'
import PropTypes from 'prop-types'

export const groupBy = (array, key) => {
  const keys = []
  const object = array.reduce(
    (o, item, index) => {
      const k = key(item, index) || ''
      if (!o[k]) {
        o[k] = []
        keys.push(k)
      }
      o[k].push(item)
      return o
    },
    {}
  )

  return keys.map(k => ({
    key: k,
    values: object[k]
  }))
}

export const sortPropType = PropTypes.oneOf(['none', 'ascending', 'descending'])

export const runSort = (cmd, array, accessor = d => d) => {
  if (cmd !== 'none') {
    const compare = cmd === 'descending' ? descending : ascending
    const original = [].concat(array)
    array.sort((a, b) => 
      compare(accessor(a), accessor(b)) ||
      ascending(original.indexOf(a), original.indexOf(b)) // stable sort
    )
  }
}

export const sortBy = (array, accessor) =>
  [].concat(array)
    .sort((a, b) =>
      ascending(accessor(a), accessor(b)) ||
      ascending(array.indexOf(a), array.indexOf(b)) // stable sort
    )

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
    suffix = ' Mrd.'
  } else if (n.length > 6) {
    scale = value => value / Math.pow(10, 6)
    suffix = ' Mio.'
  }
  return {
    scale,
    suffix
  }
}

const sFormat = (t, precision = 4, pow, type = 'r') => {
  const numberFormat4 = swissNumbers.format('d')
  const numberFormat5 = swissNumbers.format(',d')
  const numberFormat = value => {
    if (String(Math.round(value)).length > 4) {
      return numberFormat5(value)
    }
    return numberFormat4(value)
  }
  // we only round suffixed values to precision
  const numberFormatWithSuffix4 = swissNumbers.format(`.${precision}${type}`)
  const numberFormatWithSuffix5 = swissNumbers.format(`,.${precision}${type}`)
  const numberFormatWithSuffix = value => {
    if (String(Math.round(value)).length > 4) {
      return numberFormatWithSuffix5(value)
    }
    return numberFormatWithSuffix4(value)
  }
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
  const ticks = [min, min >= 0 ? min + step : 0, max]
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
    const magnitude = d3Max([max - (min > 0 ? min : 0), min].map(Math.abs))
    let pow = formatPow(t, Math.max(0, min) + magnitude / 2)
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

const subSupSplitter = (createTag) => {
  return input => {
    if (!input) {
      return input
    }
    return input.split(/(<sub>|<sup>)([^<]+)<\/su[bp]>/g).reduce(
      (elements, text, i) => {
        if (text === '<sub>' || text === '<sup>') {
          elements.nextElement = text.replace('<', '').replace('>', '')
        } else {
          if (elements.nextElement) {
            elements.push(createTag(elements.nextElement, elements.nextElement + i, text))
            elements.nextElement = null
          } else {
            elements.push(text)
          }
        }
        return elements
      },
      []
    )
  }
}

export const subsup = subSupSplitter((tag, key, text) => createElement(tag, {key}, text))
subsup.svg = subSupSplitter((tag, key, text) => {
  return createElement('tspan', {
    key,
    fontSize: '75%',
    dy: tag === 'sub' ? '0.25em' : '-0.5em'
  }, text)
})

export const transparentAxisStroke = 'rgba(0,0,0,0.17)'
export const circleFill = '#fff'

export const deduplicate = (d, i, all) => all.indexOf(d) === i


// This is unsafe
// - all props that are passed to unsafeDatumFn should not be user defined
//   currently: filter, columnFilter.test, category, highlight
// eslint-disable-next-line no-new-func
export const unsafeDatumFn = code => new Function('datum', `return ${code}`)