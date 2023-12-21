import { gql } from '../gql'

export const MARKETING_PAGE_CMS_QUERY = gql(`
query marketingLandingPageQuery {
  marketingLandingPage {
    id
    reasons {
      title
      description
    }
    formats {
      imageDark {
        responsiveImage(imgixParams: {w: 160}) {
          src
        }
      }
      imageBright {
        responsiveImage(imgixParams: {w: 160}) {
          src
        }
      }
      title
      description
      color {
        hex
      }
    }
    sectionTeamTitle
    sectionTeamDescription
    sectionDialogTitle
    sectionDialogDescription
    sectionFormatsTitle
    sectionFormatsDescription
  }
}
`)
