import test from 'tape'
import { transformData } from './transformData'

const mockCommits = [
  {
    id: 'id1',
    parentIds: null,
    date: '2017-08-20T08:01:22.000Z',
    message: 'Initial version',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  },
  {
    id: 'id2',
    parentIds: ['id1'],
    date: '2017-08-20T09:03:22.000Z',
    message: 'Added lead',
    author: {
      email: 'patte@users.noreply.github.com',
      name: 'Patrick Recher'
    }
  },
  {
    id: 'id3',
    parentIds: ['id2'],
    date: '2017-08-20T09:41:22.000Z',
    message: 'Tried something',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  },
  {
    id: 'id4',
    parentIds: ['id2'],
    date: '2017-08-20T09:40:22.000Z',
    message: 'Added dates and times',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  },
  {
    id: 'id5',
    parentIds: ['id3'],
    date: '2017-08-20T09:42:22.000Z',
    message: 'Tried more',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  },
  {
    id: 'id6',
    parentIds: ['id4'],
    date: '2017-08-20T10:17:22.000Z',
    message: 'Some more changes',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  },
  {
    id: 'id7',
    parentIds: ['id4'],
    date: '2017-08-20T10:07:22.000Z',
    message: 'Removed stuff',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  },
  {
    id: 'id8',
    parentIds: ['id7'],
    date: '2017-08-20T14:01:22.000Z',
    message: 'More changes',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  },
  {
    id: 'id9',
    parentIds: ['id8', 'id6'],
    date: '2017-08-20T15:08:22.000Z',
    message: 'Corrected facts',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  },
  {
    id: 'id10',
    parentIds: ['id9'],
    date: '2017-08-20T16:01:22.000Z',
    message: 'Almost ready',
    author: {
      email: 'uxengine@users.noreply.github.com',
      name: 'Daniel Pfänder'
    }
  }
]

test('components.Tree.transformData', assert => {
  const assertCommit = (commit, id, slotIndex) => {
    assert.equal(commit.id, id, 'commit id')
    assert.equal(commit.data.slotIndex, slotIndex, 'commit slotIndex')
  }

  const assertLink = (link, sourceId, destinationId) => {
    assert.equal(link.sourceId, sourceId, 'link sourceId')
    assert.equal(link.destinationId, destinationId, 'link destinationId')
  }

  const { commits, links } = transformData({
    commits: mockCommits,
    milestones: []
  })

  // Verify the commits' order and assigned slotIndeces.
  assertCommit(commits[0], 'id10', 2)
  assertCommit(commits[1], 'id9', 2)
  assertCommit(commits[2], 'id8', 1)
  assertCommit(commits[3], 'id6', 2)
  assertCommit(commits[4], 'id7', 1)
  assertCommit(commits[5], 'id5', 0)
  assertCommit(commits[6], 'id3', 0)
  assertCommit(commits[7], 'id4', 2)
  assertCommit(commits[8], 'id2', 2)
  assertCommit(commits[9], 'id1', 2)

  // Verify the generated source-destination links.
  assertLink(links[0], 'id1', 'id2')
  assertLink(links[1], 'id2', 'id4')
  assertLink(links[2], 'id2', 'id3')
  assertLink(links[3], 'id3', 'id5')
  assertLink(links[4], 'id4', 'id7')
  assertLink(links[5], 'id4', 'id6')
  assertLink(links[6], 'id7', 'id8')
  assertLink(links[7], 'id8', 'id9')
  assertLink(links[8], 'id6', 'id9')
  assertLink(links[9], 'id9', 'id10')

  assert.end()
})
