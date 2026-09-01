import { defineQuery } from 'next-sanity'

export const SEO_QUERY = defineQuery(
  `*[slug.current == $slug][0]{
    "title": coalesce(pt::text(seo.title), pt::text(title)),
    "description": coalesce(pt::text(seo.description), pt::text(description)),
    "image": coalesce(seo.image, image),
    "useImageBuilder": seo.useImageBuilder,
    "imageBuilder": seo.imageBuilder,
    "heading": pt::text(heading->title),
    theme {
      name,
      accentColor,
      darkMode
    }
  }`,
)

// Same projection as SEO_QUERY, but also matches by document id (published
// or draft) — used by /api/og so the Studio preview can request a not-yet-
// published article/page, which may have no frozen slug.current yet (see
// the studio repo's slug-freeze-publish function for why). Kept separate
// from SEO_QUERY rather than adding $id there too, so the existing
// generateMetadata callers don't have to start passing an unused param.
export const OG_SHARE_IMAGE_QUERY = defineQuery(
  `*[slug.current == $slug || _id == $id || _id == "drafts." + $id][0]{
    "title": coalesce(pt::text(seo.title), pt::text(title)),
    "description": coalesce(pt::text(seo.description), pt::text(description)),
    "image": coalesce(seo.image, image),
    "useImageBuilder": seo.useImageBuilder,
    "imageBuilder": seo.imageBuilder,
    "heading": pt::text(heading->title),
    theme {
      name,
      accentColor,
      darkMode
    }
  }`,
)
