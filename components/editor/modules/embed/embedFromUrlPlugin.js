const YOUTUBE_REGEX = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/

const VIMEO_REGEX = /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|)(\d+)(?:|\/\?)/

const TWITTER_REGEX = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/

const matchUrl = url => {
  if (YOUTUBE_REGEX.test(url)) {
    return {
      embedType: 'youtube',
      embedData: {
        id: YOUTUBE_REGEX.exec(url)[1]
      }
    }
  }
  if (VIMEO_REGEX.test(url)) {
    return {
      embedType: 'vimeo',
      embedData: {
        id: VIMEO_REGEX.exec(url)[5]
      }
    }
  }

  if (TWITTER_REGEX.test(url)) {
    return {
      embedType: 'twitter',
      embedData: {
        id: TWITTER_REGEX.exec(url)[3]
      }
    }
  }
}

export default ({match, TYPE}) => ({
  onKeyDown (e, change) {
    if (e.key !== 'Enter') return
    if (e.shiftKey !== false) return

    const { value } = change
    if (!value.isCollapsed) return

    const block = value.blocks.first()

    if (!match(block)) return

    const text = block.text

    if (!text) return

    const data = matchUrl(text.trim())

    if (data) {
      return change.setNodeByKey(
        block.key,
        {
          type: TYPE,
          data
        }
      )
    }
  }
})
