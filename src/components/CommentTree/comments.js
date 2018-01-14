const profilePicture = '/static/profilePicture1.png'

export const mkComment = (n, children, pageInfo) => ({
  id: n,
  displayAuthor: {
    profilePicture,
    name: `${n} – Christof Moser`,
    credential: {description: 'Journalist, Autor, Diktator, Rebel und Republikaner', verified: true}
  },
  score: 8,
  userVote: 'DOWN',
  content: 'Journalismus strebt nach Klarheit, er ist der Feind der uralten Angst vor dem Neuen.',
  comments: children.length === 0
    ? (pageInfo ? {totalCount: 27, pageInfo, nodes: []} : undefined)
    : {totalCount: 27, pageInfo, nodes: children}
})

export const comment1 = mkComment('1', [])

export const comment2 = mkComment('2', [
  mkComment('2.1', [])
], {hasNextPage: true})

export const comment3 = mkComment('3', [
  mkComment('3.1', []),
  mkComment('3.2', [])
], {hasNextPage: true})

export const comment4 = mkComment('4', [
  mkComment('4.1', []),
  mkComment('4.2', []),
  mkComment('4.3', [])
], {hasNextPage: true})

export const comment5 = mkComment('5', [
  mkComment('5.1', [
    mkComment('5.1.1', [])
  ]),
  mkComment('5.2', [], {hasNextPage: true})
], {hasNextPage: true})

export const comment6 = mkComment('6', [
  mkComment('6.1', [
    mkComment('6.1.1', [], {hasNextPage: true}),
    mkComment('6.1.2', [])
  ], {hasNextPage: true}),
  mkComment('6.2', [])
], {hasNextPage: true})

export const comment7 = mkComment('7', [
  mkComment('7.1', [
    mkComment('7.1.1', []),
    mkComment('7.1.2', [])
  ]),
  mkComment('7.2', [
    mkComment('7.2.1', [])
  ])
])

export const comment8 = mkComment('8', [
  mkComment('8.1', [
    mkComment('8.1.1', [
      mkComment('8.1.1.1', [])
    ])
  ])
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
