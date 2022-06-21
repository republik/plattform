const {
  slateFindLinkHref: findLinkHref,
} = require('@orbiting/backend-modules-utils')

const hotness = require('../hotness')

const create = async (
  {
    id,
    discussionId,
    parentId,
    userId,
    content,
    tags,
    published = true,
    adminUnpublished = false,
    now = new Date(),
  },
  { loaders, t },
) => {
  let parentIds
  if (parentId) {
    const parent = await loaders.Comment.byId.load(parentId)
    if (!parent) {
      throw new Error(t('api/comment/parent/404'))
    }
    parentIds = [...(parent.parentIds || []), parentId]
  }

  const urls = await findLinkHref(content)
  const embedUrl = urls.length ? urls.slice(-1)[0] : null

  return {
    ...(id ? { id } : {}),
    discussionId,
    ...(parentIds ? { parentIds } : {}),
    depth: (parentIds && parentIds.length) || 0,
    userId,
    content,
    urls,
    embedUrl,
    hotness: hotness(0, 0, now.getTime()),
    ...(tags ? { tags } : {}),
    published,
    adminUnpublished,
    createdAt: now,
    updatedAt: now,
  }
}

const edit = async ({ content, tags, now = new Date() }) => {
  const urls = await findLinkHref(content)
  const embedUrl = urls.length ? urls.slice(-1)[0] : null

  return {
    content,
    urls,
    embedUrl,
    ...(tags ? { tags } : {}),
    published: true,
    updatedAt: now,
  }
}

module.exports = {
  create,
  edit,
}
