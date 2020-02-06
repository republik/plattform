const stripUrlFromText = (url, content) => {
  if (!url || !content) {
    return content
  }
  if (
    content.length === url.length ||
    content.length === (url.length + 1) // trailing slash removed by get-urls
  ) {
    return ''
  }
  return content
}

module.exports = {
  stripUrlFromText
}
