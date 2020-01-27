import { exampleMdast } from './exampleMdast'

const profilePicture = '/static/profilePicture1.png'

export const linkPreview1 = {
  url: 'https://republik.ch/2020/01/17/das-perfekte-bordell',
  title: 'Das perfekte Bordell',
  description:
    'Sexarbeiterinnen werden bis heute an den Rand der Gesellschaft gedrängt, bemitleidet oder gar verachtet. Es ist höchste Zeit für einen neuen Umgang mit der Prostitution.',
  imageUrl: '/static/bordell.jpeg',
  siteName: 'republik.ch',
  siteImageUrl: '/static/apple-touch-icon.png'
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
