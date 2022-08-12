const process = {
  common: require('./common/process'),
  mdast: require('./mdast/process'),
  slate: require('./slate/process'),
}

const processContentHashing = (type, content) => {
  const processContentHashing =
    process[type || 'mdast']?.processContentHashing ||
    process.common?.processContentHashing

  if (!processContentHashing) {
    console.warn(
      `process/processContentHashing for type "${type}" not implemented`,
    )
    return
  }

  return processContentHashing(content)
}

const processRepoImageUrlsInContent = async (type, content, fn) => {
  const processRepoImageUrlsInContent =
    process[type || 'mdast']?.processRepoImageUrlsInContent ||
    process.common?.processRepoImageUrlsInContent

  if (!processRepoImageUrlsInContent) {
    console.warn(
      `process/processRepoImageUrlsInContent for type "${type}" not implemented`,
    )
    return
  }

  return processRepoImageUrlsInContent(content, fn)
}

const processEmbedImageUrlsInContent = async (type, content, fn) => {
  const processEmbedImageUrlsInContent =
    process[type || 'mdast']?.processEmbedImageUrlsInContent ||
    process.common?.processEmbedImageUrlsInContent

  if (!processEmbedImageUrlsInContent) {
    console.warn(
      `process/processEmbedImageUrlsInContent for type "${type}" not implemented`,
    )
    return
  }

  return processEmbedImageUrlsInContent(content, fn)
}

const processRepoImageUrlsInMeta = async (type, content, fn) => {
  const processRepoImageUrlsInMeta =
    process[type || 'mdast']?.processRepoImageUrlsInMeta ||
    process.common?.processRepoImageUrlsInMeta

  if (!processRepoImageUrlsInMeta) {
    console.warn(
      `process/processRepoImageUrlsInMeta for type "${type}" not implemented`,
    )
    return
  }

  return processRepoImageUrlsInMeta(content, fn)
}

const processEmbedsInContent = async (type, content, fn, context) => {
  const processEmbedsInContent =
    process[type || 'mdast']?.processEmbedsInContent ||
    process.common?.processEmbedsInContent

  if (!processEmbedsInContent) {
    console.warn(
      `process/processEmbedsInContent for type "${type}" not implemented`,
    )
    return
  }

  return processEmbedsInContent(content, fn, context)
}

const processMembersOnlyZonesInContent = (type, content, user, apiKey) => {
  const processMembersOnlyZonesInContent =
    process[type || 'mdast']?.processMembersOnlyZonesInContent ||
    process.common?.processMembersOnlyZonesInContent

  if (!processMembersOnlyZonesInContent) {
    console.warn(
      `process/processMembersOnlyZonesInContent for type "${type}" not implemented`,
    )
    return
  }

  return processMembersOnlyZonesInContent(content, user, apiKey)
}

const processNodeModifiersInContent = (type, content, user) => {
  const processNodeModifiersInContent =
    process[type || 'mdast']?.processNodeModifiersInContent ||
    process.common?.processNodeModifiersInContent

  if (!processNodeModifiersInContent) {
    console.warn(
      `process/processNodeModifiersInContent for type "${type}" not implemented`,
    )
    return
  }

  return processNodeModifiersInContent(content, user)
}

const processIfHasAccess = (type, content, user, apiKey) => {
  const processIfHasAccess =
    process[type || 'mdast']?.processIfHasAccess ||
    process.common?.processIfHasAccess

  if (!processIfHasAccess) {
    console.warn(
      `process/processIfHasAccess for type "${type}" not implemented`,
    )
    return
  }

  return processIfHasAccess(content, user, apiKey)
}

module.exports = {
  processContentHashing,
  processRepoImageUrlsInContent,
  processEmbedImageUrlsInContent,
  processRepoImageUrlsInMeta,
  processEmbedsInContent,
  processMembersOnlyZonesInContent,
  processNodeModifiersInContent,
  processIfHasAccess,
}
