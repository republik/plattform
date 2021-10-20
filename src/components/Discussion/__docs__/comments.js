import { exampleMdast } from './exampleMdast'

const profilePicture = '/static/profilePicture1.png'

export const linkPreview1 = {
  url: 'https://republik.ch/2020/01/17/das-perfekte-bordell',
  title: 'Das perfekte Bordell',
  description:
    'Sexarbeiterinnen werden bis heute an den Rand der Gesellschaft gedrängt, bemitleidet oder gar verachtet. Es ist höchste Zeit für einen neuen Umgang mit der Prostitution.',
  imageUrl: '/static/bordell.jpeg',
  imageAlt: 'Stadtbordell',
  siteName: 'republik.ch',
  siteImageUrl: '/static/apple-touch-icon.png',
  __typename: 'LinkPreview'
}

export const linkPreview2 = {
  id: '1217356328047403008',
  url: 'https://twitter.com/RepublikMagazin/status/1217356328047403008',
  text:
    '@tpreusse @adfichter Helfen Sie mit, die nächsten #2JahreRepublik zu ermöglichen? So langsam finden wir, das lohnt sich. 😉\n\nhttp://www.republik.ch/cockpit',
  html:
    '<a href="https://twitter.com/tpreusse" target="_blank" rel="noopener noreferrer">@tpreusse</a> <a href="https://twitter.com/adfichter" target="_blank" rel="noopener noreferrer">@adfichter</a> Helfen Sie mit, die nächsten #2JahreRepublik zu ermöglichen? So langsam finden wir, das lohnt sich. 😉<br/><br/><a href="http://www.republik.ch/cockpit" target="_blank" rel="noopener noreferrer">republik.ch/cockpit</a>',
  userName: 'Republik',
  userScreenName: 'RepublikMagazin',
  userProfileImageUrl:
    '/static/twitter_icon.jpg',
  image: '/static/tweet_preview.jpg',
  createdAt: '2020-01-15T08:02:20.000Z',
  __typename: 'TwitterEmbed'
}

export const mentioningDocument = {
  iconUrl: '/static/top-story-badge.png',
  document: {
    meta: {
      path: '/2019/02/18/das-reaktionaerste-land-der-welt'
    }
  },
  fragmentId: 'ein-struktureller-wahnsinn'
}

export const mkComment = (
  n,
  children,
  extraCount = 0,
  linkPreview = false
) => ({
  id: n,
  displayAuthor: {
    profilePicture,
    name: `${n} – Christof Moser`,
    credential: {
      description: 'Journalist, Autor, Diktator, Rebel und Republikaner',
      verified: true
    }
  },
  upVotes: 8,
  downVotes: 3,
  userVote: 'DOWN',
  content: exampleMdast,
  published: true,
  createdAt: '2019-01-01',
  updatedAt: '2019-01-01',
  parentIds: [],
  tags: [],
  comments: {
    totalCount: children.reduce(
      (a, node) => a + 1 + node.comments.totalCount,
      extraCount
    ),
    nodes: children.map(child => {
      child.parentIds = child.id.split('.').slice(0, -1)
      return child
    })
  },
  embed: linkPreview ? linkPreview1 : null
})

export const comment0 = mkComment('0', [])
export const comment1 = mkComment('1', [])

export const comment2 = mkComment('2', [mkComment('2.1', [])], 2)

export const comment3 = mkComment('3', [
  mkComment('3.1', []),
  mkComment('3.2', [])
])

export const comment4 = mkComment('4', [
  mkComment('4.1', []),
  mkComment('4.2', []),
  mkComment('4.3', [])
])

export const comment5 = mkComment('5', [
  mkComment('5.1', [mkComment('5.1.1', [])]),
  mkComment('5.2', [])
])

export const comment6 = mkComment('6', [
  mkComment('6.1', [mkComment('6.1.1', []), mkComment('6.1.2', [])]),
  mkComment('6.2', [])
])

export const comment7 = mkComment('7', [
  mkComment('7.1', [mkComment('7.1.1', []), mkComment('7.1.2', [])]),
  mkComment('7.2', [mkComment('7.2.1', [])])
])

export const comment8 = mkComment('8', [
  mkComment('8.1', [mkComment('8.1.1', [mkComment('8.1.1.1', [])])])
])

export const comment9 = mkComment('9', [
  mkComment('9.1', [
    mkComment('9.1.1', []),
    mkComment('9.1.2', []),
    mkComment('9.1.3', [
      mkComment('9.1.3.1', [
        mkComment('9.1.3.1.1', []),
        mkComment('9.1.3.1.2', [
          mkComment('9.1.3.1.2.1', []),
          mkComment('9.1.3.1.2.2', [])
        ])
      ])
    ])
  ])
])

export const comment10 = mkComment('10', [], 0, true)
export const comment11 = mkComment('11', [], 0, true)
