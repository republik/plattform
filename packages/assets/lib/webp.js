const addSuffix = (url) => {
  const [base, query] = url.split('?')
  if (!query) {
    return base
  }
  return `${base}.webp?${query}`
}

module.exports = {
  addSuffix
}
