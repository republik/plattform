import { FEATURED_SECTIONS_OVERVIEW_QUERY_RESULT } from '@/sanity.types'
import { defineQuery } from 'next-sanity'

// The "Rubriken-Übersicht" page (slug "/suche") holds one "menu" block per
// cluster (Briefings, Formate, Kolumnen, ...) plus a couple of standalone
// links, all editable in Sanity.
export const FEATURED_SECTIONS_OVERVIEW_QUERY = defineQuery(`
  *[_type == "page" && slug.current == "/suche"][0]{
    pageBuilder[_type == "menu"]{
      _key,
      hasSeparator,
      heading{
        title,
        page->{
          _id,
          "title": pt::text(title),
          "slug": slug.current,
          "color": theme.accentColor.hex
        }
      },
      pages[]{
        _key,
        _type,
        _type == "link" => {
          href,
          title
        },
        _type == "reference" => {
          "page": @->{
            _id,
            "title": pt::text(title),
            "slug": slug.current,
            "color": theme.accentColor.hex
          }
        }
      }
    }
  }
`)

export type FeaturedSectionsOverviewMenuBlock = NonNullable<
  NonNullable<FEATURED_SECTIONS_OVERVIEW_QUERY_RESULT>['pageBuilder']
>[number]
