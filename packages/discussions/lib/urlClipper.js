const clipUrlInText = (url, content) => {
  if (!url || !content) {
    return content
  }
  if (
    content.length === url.length ||
    content.length === (url.length + 1)
  ) {
    return ''
  }
  return content
}

module.exports = {
  clipUrlInText
}
