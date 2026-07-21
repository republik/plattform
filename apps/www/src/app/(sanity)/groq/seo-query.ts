import { defineQuery } from 'next-sanity'

export const SEO_QUERY = defineQuery(
  `*[slug.current == $slug][0]{
    "title": coalesce(seo.title, pt::text(title)),
    "description": coalesce(seo.description, pt::text(description)),
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
