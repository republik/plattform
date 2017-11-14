const YOUTUBE_REGEX = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/

const VIMEO_REGEX = /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|)(\d+)(?:|\/\?)/

const TWITTER_REGEX = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/

const isEmbedUrl = url =>
  TWITTER_REGEX.test(url) || VIMEO_REGEX.test(url) || YOUTUBE_REGEX.test(url)

export default ({match, TYPE}) => ({
  onKeyDown (event, change) {
    if (event.key !== 'Enter') return
    if (event.shiftKey !== false) return

    const { value } = change
    if (!value.isCollapsed) return

    const block = value.blocks.first()

    if (!block || !match(block)) return

    const text = block.text

    if (!text) return

    event.preventDefault()

    const url = text.trim()

    if (isEmbedUrl(url)) {
      return change
        .setNodeByKey(block.key, {
          type: TYPE,
          data: {
            url
          }
        })
        .select({
          anchorKey: block.key,
          focusKey: block.key,
          anchorOffset: 1,
          focusOffset: 1
        })
    }
  }
})
