const hotness = require('../hotness')
const { linkPreview: { getLinkPreviewUrlFromText } } = require('@orbiting/backend-modules-embeds')

const clipUrlFromContent = (content, url) => {
  if (!url || !content) {
    return content
  }
  const index = content.indexOf(url)
  if (index === 0) {
    return content.replace(url, '')
      .trim()
  }
  if (
    index === content.length - url.length ||
    index === content.length - url.length - 1 // trailing slash
  ) {
    return content.substring(0, index)
      .trim()
  }
  return content
}

const create = async (
  {
    id,
    discussionId,
    parentId,
    userId,
    content,
    tags,
    now = new Date(),
    isBoard
  },
  {
    loaders,
    t
  }
) => {
  let parentIds
  if (parentId) {
    const parent = await loaders.Comment.byId.load(parentId)
    if (!parent) {
      throw new Error(t('api/comment/parent/404'))
    }
    parentIds = [...(parent.parentIds || []), parentId]
  }

  const linkPreviewUrl = isBoard
    ? getLinkPreviewUrlFromText(content) || null
    : null
  const newContent = isBoard && linkPreviewUrl
    ? clipUrlFromContent(content, linkPreviewUrl)
    : content

  return {
    ...id ? { id } : { },
    discussionId,
    ...parentIds ? { parentIds } : {},
    depth: (parentIds && parentIds.length) || 0,
    userId,
    linkPreviewUrl,
    content: newContent,
    hotness: hotness(0, 0, (now.getTime())),
    ...tags ? { tags } : {},
    createdAt: now,
    updatedAt: now
  }
}

const edit = ({
  content,
  tags,
  now = new Date(),
  isBoard
}) => {
  const linkPreviewUrl = isBoard
    ? getLinkPreviewUrlFromText(content) || null
    : null
  const newContent = isBoard && linkPreviewUrl
    ? clipUrlFromContent(content, linkPreviewUrl)
    : content

  return {
    linkPreviewUrl,
    content: newContent,
    ...tags ? { tags } : {},
    published: true,
    updatedAt: now
  }
}

module.exports = {
  create,
  edit
}
