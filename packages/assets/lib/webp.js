const addSuffix = (url) => {
  const [base, query] = url.split('?')
  if (!query) {
    return base
  }
  // prevent double suffix
  // - e.g. when resolving twice (content & children)
  if (base.endsWith('.webp')) {
    return url
  }
  return `${base}.webp?${query}`
}

module.exports = {
  addSuffix
}
