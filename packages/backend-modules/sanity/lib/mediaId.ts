// `collectionMediaItems.mediaId` is an opaque text key, so storing playback
// position for Sanity-backed audio needs no schema change — only a stable
// string. It is minted here, server-side, because it is effectively part of a
// primary key: two independently-shipped clients (the web bundle and a
// version-gated native app) deriving it by convention would file the same
// article's position under two keys the moment they disagreed, with no way to
// reconcile afterwards.
//
// Mirrors publikator/lib/Document.js's `base64(`${repoId}/audio`)` so both
// content systems mint mediaIds the same way. Derived, not stored — and stable
// across audio regeneration, since it keys on the document, not the asset.
//
// Deliberately its own module rather than part of lib/audio.ts: that one builds
// its Sanity client at import time, so requiring it from `collections` would
// construct a client (and read SANITY_* env) as a side effect of a require.
export const sanityAudioMediaId = (sanityId: string) =>
  Buffer.from(`${sanityId}/audio`).toString('base64')
