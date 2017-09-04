let _paq
if (typeof window !== 'undefined') {
  _paq = window._paq = window._paq || []
}

const __DEV__ = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

const track = (...args) => {
  if (!_paq) {
    if (__DEV__) {
      throw new Error('Can\'t use the imperative track api while server rendering')
    }
    return
  }

  _paq.push(...args)
  if (__DEV__) {
    console.log('track', ...args)
  }
}

export default track
