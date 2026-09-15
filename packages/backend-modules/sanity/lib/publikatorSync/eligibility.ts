// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Not every Publikator repo is an article: `meta.template` also covers
// format/section/page/front pages, and `meta.series` can hold a series
// *object* (the series-overview repo, as opposed to a plain string reference
// to one). Those all need their own Sanity `_type` (`page`, `front`,
// `articleCollection`, …) built with full-corpus context that only the real
// cutover migration (studio/import/publikator/src/transform.ts) has — see
// this hook's "Scope decision". Mirrors that file's own branch selection
// (BRANCHES = front|page|format|section|series|article, with "article" as
// the fallthrough for everything else, e.g. editorialNewsletter/discussion).
//
// Sanity's `_type` is immutable per document id, so writing the wrong type
// at a repo's deterministic id here would permanently collide with whatever
// the real migration tries to create there later — this check exists to
// make sure this transition hook only ever touches ids it's safe to own.
export interface PublikatorMetaLike {
  template?: unknown
  isTemplate?: unknown
  series?: unknown
}

const NON_ARTICLE_TEMPLATES = new Set(['format', 'section', 'page', 'front'])

export function isArticleLikeMeta(
  meta: PublikatorMetaLike | undefined | null,
): boolean {
  if (!meta) return true
  if (meta.isTemplate) return false
  if (
    typeof meta.template === 'string' &&
    NON_ARTICLE_TEMPLATES.has(meta.template)
  ) {
    return false
  }
  const isSeriesObject =
    typeof meta.series === 'object' &&
    meta.series !== null &&
    !Array.isArray(meta.series)
  return !isSeriesObject
}
