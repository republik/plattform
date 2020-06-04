const data = {
  repo: {
    id: '***',
    isArchived: false,
    commits: {
      pageInfo: {
        hasNextPage: true,
        endCursor: '2019-05-29T15:58:21Z',
        __typename: 'PageInfo'
      },
      nodes: [
        {
          id: '47357ecfc0c3b6ad565bc0d52d5be34e5eefabad',
          message: 'datenbox',
          parentIds: ['0dfef369546b9c81ce7746848d9d7ed0aab31c6b'],
          date: '2019-05-31T10:00:39.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '0dfef369546b9c81ce7746848d9d7ed0aab31c6b',
          message: 'grafiken ok',
          parentIds: ['cfccc141bc5f488e6462346870b66d603af614c0'],
          date: '2019-05-31T09:59:03.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: 'fee98162bfd9cb6b472f6eef637d5c483afd9ef8',
          message: 'produziert',
          parentIds: ['cfccc141bc5f488e6462346870b66d603af614c0'],
          date: '2019-05-31T09:01:34.000Z',
          author: {
            email: '***@republik.ch',
            name: 'B*** H***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: 'cfccc141bc5f488e6462346870b66d603af614c0',
          message:
            'go Korrektorat - Grafiken müssen noch ferttigemancht werden',
          parentIds: ['0f5ac6bd9dca8fa27b105c6c19a96408820555cb'],
          date: '2019-05-31T08:03:17.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '0f5ac6bd9dca8fa27b105c6c19a96408820555cb',
          message: 'charts 1-3',
          parentIds: ['0d4329957dff2582052917a2d90a79a0d494eb1b'],
          date: '2019-05-31T07:53:51.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '310fb89a6649913edd5a4057391b35424ba3a7cf',
          message: 'übergang wärmekarte und letzte Kaltzeit',
          parentIds: ['0d4329957dff2582052917a2d90a79a0d494eb1b'],
          date: '2019-05-31T07:53:31.000Z',
          author: {
            email: '***@republik.ch',
            name: 'A*** B***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '0d4329957dff2582052917a2d90a79a0d494eb1b',
          message: 'wip',
          parentIds: ['ac059348cf06a88a43c2ffa580c5d18c3b14d0f7'],
          date: '2019-05-31T07:27:49.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: 'ac059348cf06a88a43c2ffa580c5d18c3b14d0f7',
          message: 'wip',
          parentIds: ['04a3745214f0783c46971bb053b995f3d7eac82f'],
          date: '2019-05-31T07:18:33.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '04a3745214f0783c46971bb053b995f3d7eac82f',
          message: 'text 1',
          parentIds: ['af98600597c7817eebba164991fc6668e704db63'],
          date: '2019-05-31T07:12:38.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: 'af98600597c7817eebba164991fc6668e704db63',
          message: 'update',
          parentIds: ['757d0ed001334ee0cf77fa5feb3bda96563dff2a'],
          date: '2019-05-30T18:53:45.000Z',
          author: {
            email: '***@republik.ch',
            name: 'A*** B***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: 'abc1073b7410399c9830cb9182c634903aaee9a6',
          message: 'grafikfarben',
          parentIds: ['757d0ed001334ee0cf77fa5feb3bda96563dff2a'],
          date: '2019-05-30T13:47:31.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '757d0ed001334ee0cf77fa5feb3bda96563dff2a',
          message: 'an Arian',
          parentIds: ['84ba70f42cbc598ec134a06b3b721b6ab8fda83f'],
          date: '2019-05-30T13:28:54.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '84ba70f42cbc598ec134a06b3b721b6ab8fda83f',
          message: 'wip',
          parentIds: ['6d2a88385caa053a4e24cf6430a173921542f1aa'],
          date: '2019-05-30T12:53:08.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '6d2a88385caa053a4e24cf6430a173921542f1aa',
          message: 'new charts',
          parentIds: ['a3a55bf3aaa486b0f9208d084faa0c49aeca5db1'],
          date: '2019-05-30T12:33:43.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: 'a3a55bf3aaa486b0f9208d084faa0c49aeca5db1',
          message: 'wip',
          parentIds: ['195681a40cf4d5a02cf384964afcc05f6914e07e'],
          date: '2019-05-30T11:17:18.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '195681a40cf4d5a02cf384964afcc05f6914e07e',
          message: 'wip',
          parentIds: ['12623de489c6af59d5cf399ca2cff3ac9da594b6'],
          date: '2019-05-30T10:37:06.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '12623de489c6af59d5cf399ca2cff3ac9da594b6',
          message: 'wip',
          parentIds: ['3c1bf261136cd4f7705edb84e9d74f25c9a6b29a'],
          date: '2019-05-29T17:14:23.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '3c1bf261136cd4f7705edb84e9d74f25c9a6b29a',
          message: 'wip',
          parentIds: ['6b1cd9bc7f6aa0b7485ad2b0e197e0defe49b743'],
          date: '2019-05-29T16:42:13.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '6b1cd9bc7f6aa0b7485ad2b0e197e0defe49b743',
          message: 'wip',
          parentIds: ['3d9b7ac037296563d8348a95dc483560dc4e1e87'],
          date: '2019-05-29T16:17:56.000Z',
          author: {
            email: '***@republik.ch',
            name: 'S*** S***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        },
        {
          id: '4c9988f2f0e240b8c746ae3bc96cc2f8ce411abf',
          message: 'Infoboxen',
          parentIds: ['dac80fbf07b8f79bcada662c854e4c1e3a57c24c'],
          date: '2019-05-29T15:58:21.000Z',
          author: {
            email: '***@republik.ch',
            name: 'A*** B***',
            __typename: 'Author'
          },
          __typename: 'Commit'
        }
      ],
      __typename: 'CommitConnection'
    },
    milestones: [
      {
        name: 'startProduction',
        message: ' ',
        immutable: false,
        commit: {
          id: 'cfccc141bc5f488e6462346870b66d603af614c0',
          __typename: 'Commit'
        },
        author: {
          email: '***@republik.ch',
          name: 'K*** M***',
          __typename: 'Author'
        },
        __typename: 'Milestone'
      }
    ],
    __typename: 'Repo'
  }
}

export default data
