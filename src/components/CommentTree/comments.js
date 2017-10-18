const profilePicture = '/static/profilePicture1.png'

export const mkComment = (n, children, more) => ({
  id: n,
  displayAuthor: {
    profilePicture,
    name: `${n} – Paul Ullrich`,
    credential: {description: 'Bundesrat', verified: true}
  },
  score: 8,
  content: 'Ihr könnt ruhig über den Film Shades of Grey herziehen. Aber Mr. Grey ist verdammt heiss.',
  replies: children.length === 0 && more === undefined
    ? undefined
    : {comments: children, more}
})

export const comment1 = mkComment('1', [])

export const comment2 = mkComment('2', [
  mkComment('2.1', [], {count: 1, load() {}})
])

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
  mkComment('5.1', [
    mkComment('5.1.1', [])
  ]),
  mkComment('5.2', [])
])

export const comment6 = mkComment('6', [
  mkComment('6.1', [
    mkComment('6.1.1', []),
    mkComment('6.1.2', [])
  ]),
  mkComment('6.2', [])
])

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
