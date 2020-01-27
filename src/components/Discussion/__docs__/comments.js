import { exampleMdast } from './exampleMdast'

const profilePicture = '/static/profilePicture1.png'

export const linkPreview1 = {
  url: 'https://republik.ch/2020/01/17/das-perfekte-bordell',
  title: 'Das perfekte Bordell',
  description:
    'Sexarbeiterinnen werden bis heute an den Rand der Gesellschaft gedrängt, bemitleidet oder gar verachtet. Es ist höchste Zeit für einen neuen Umgang mit der Prostitution.',
  imageUrl:
    'http://localhost:5020/proxy?originalURL=https%3A%2F%2Fcdn.repub.ch%2Fs3%2Frepublik-assets%2Fgithub%2Frepublik%2Farticle-das-perfekte-bordell%2Fimages%2Fc8df2dd6fc7e3fb8fd6a1b9a607947298ef5b522.jpeg%3Fsize%3D1984x992&mac=d48c0afdf66a2e56372c8781b4069a3b9c79302968e10c6ec0470185ae902464',
  siteName: 'republik.ch',
  siteImageUrl:
    'http://localhost:5020/proxy?originalURL=https%3A%2F%2Fwww.republik.ch%2Fstatic%2Fapple-touch-icon.png&mac=8c3a32e9ffd81a19940082e0beead4eb7586c1bb49b902a424d2fa68597338bd'
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
    nodes: children
  },
  linkPreview: linkPreview ? linkPreview1 : null
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
