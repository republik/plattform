const { metaFieldResolver } = require('./resolve')

const getMeta = doc => {
  if (doc._meta) {
    return doc._meta
  }

  // see _all note in Document.content resolver
  const resolvedFields = doc._all
    ? metaFieldResolver(doc.content.meta, doc._all)
    : { }

  const credits = doc.content.meta.credits

  const { audioSourceMp3, audioSourceAac, audioSourceOgg } = doc.content.meta
  const audioSource = audioSourceMp3 || audioSourceAac || audioSourceOgg ? {
    mp3: audioSourceMp3,
    aac: audioSourceAac,
    ogg: audioSourceOgg
  } : null

  doc._meta = {
    ...doc.content.meta,
    credits,
    audioSource,
    ...resolvedFields
  }
  return doc._meta
}

module.exports = {
  getMeta
}
