const hotness = require('../hotness')
const { linkPreview: { getLinkPreviewUrlFromText } } = require('@orbiting/backend-modules-embeds')

const create = async (
  {
    id,
    discussionId,
    parentId,
    userId,
    content,
    tags,
    now = new Date()
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

  return {
    ...id ? { id } : { },
    discussionId,
    ...parentIds ? { parentIds } : {},
    depth: (parentIds && parentIds.length) || 0,
    userId,
    content,
    linkPreviewUrl: getLinkPreviewUrlFromText(content) || null,
    hotness: hotness(0, 0, (now.getTime())),
    ...tags ? { tags } : {},
    createdAt: now,
    updatedAt: now
  }
}

const edit = ({
  content,
  tags,
  now = new Date()
}) => ({
  content,
  linkPreviewUrl: getLinkPreviewUrlFromText(content) || null,
  ...tags ? { tags } : {},
  published: true,
  updatedAt: now
})

module.exports = {
  create,
  edit
}
