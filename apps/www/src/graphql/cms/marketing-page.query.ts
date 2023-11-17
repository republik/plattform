import { gql } from '../gql'

export const MARKETING_PAGE_CMS_QUERY = gql(`
query marketingStartseiteQuery {
  marketingStartseite {
    id
    pitches {
      title
      text
    }
    sectionTeam {
      title
      description
    }
    sectionDialog {
      title
      description
    }
    sectionNuetzlich {
      title
      description
    }
    formate {
      bild {
        alt
        url
        customData
      }
      titel
      description
    }
  }
}
`)
