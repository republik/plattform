import { GITHUB_ORG } from '../../lib/settings'

export const placeholderRepos = {
  newsletters: [
    {
      publicationDays: [1, 2, 3, 4, 5],
      publicationTime: '4:30',
      repoId: `${GITHUB_ORG}/template-www`
    },
    {
      publicationDays: [1, 2, 3, 4, 5],
      publicationTime: '19:00',
      repoId: `${GITHUB_ORG}/template-covid-19-uhr-nl`
    },
    {
      publicationDays: [6],
      publicationTime: '4:30',
      repoId: `${GITHUB_ORG}/template-weekend`
    }
  ]
}
