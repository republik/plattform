import { ascending, descending, max } from 'd3-array'
import { scaleOrdinal } from 'd3-scale'

export const transformData = (props) => {
  const colors = scaleOrdinal([
    '#D0A2CA',
    '#9383BD',
    '#AD5676',
    '#EA8B64',
    '#C9B71D',
    '#90AA00',
    '#8A786A',
    '#6DBF9B',
    '#159B73',
    '#4772BA',
    '#006B95',
    '#229EDC',
  ]).domain(
    []
      .concat(props.commits)
      .reverse()
      .map((c) => c.author.email),
  )

  let commits = props.commits
    .map((commit) => {
      return {
        id: commit.id,
        date: commit.date,
        author: commit.author,
        message: commit.message,
        parentIds: commit.parentIds,
        milestones: props.milestones.filter((o) => {
          return o.commit.id === commit.id && o.name !== 'meta'
        }),
      }
    })
    .sort(function (a, b) {
      return ascending(new Date(a.date), new Date(b.date))
    })

  let parentNodes = new Map()
  let links = []

  commits.forEach((commit) => {
    commit.setListItemRef = (ref) => {
      commit.listItemRef = ref
    }
    commit.setNodeRef = (ref) => {
      commit.nodeRef = ref
    }
    commit.data = {
      slotIndex: null,
    }
    if (!commit.parentIds) return
    commit.parentIds.forEach((parentId) => {
      let children = []
      if (parentNodes.has(parentId)) {
        children = [...parentNodes.get(parentId)]
      }
      if (!children.indexOf(commit.id) === -1) {
        return
      }
      children.push(commit.id)
      parentNodes.set(parentId, children)
      links.push({
        sourceId: parentId,
        destinationId: commit.id,
      })
    })
  })

  links.forEach((link) => {
    link.setRef = (ref) => {
      link.ref = ref
    }
  })

  assignSlots({ commits, parentNodes, links })
  return {
    commits: commits,
    numSlots: max(commits, (commit) => commit.data.slotIndex + 1),
    links: links,
    parentNodes: parentNodes,
    colors,
  }
}

const getOrderedPaths = (paths) => {
  // TODO: More sophisticated ordering.
  return paths.sort(function (a, b) {
    return descending(a.length, b.length)
  })
}

const reducePaths = ({ links }) => {
  // following assumtions are made
  // - links are sorted by ascending creation date
  // - sourceId is the parent—older id
  const rawLinks = links.map(({ sourceId, destinationId }) => [
    sourceId,
    destinationId,
  ])

  return rawLinks.reduce((paths, link) => {
    const endPaths = paths.filter((path) =>
      link.some((id) => id === path[path.length - 1]),
    )
    if (endPaths.length) {
      endPaths.forEach((endPath) => {
        endPath.push(link[1])
      })
    } else {
      const middlePath = paths.find((path) =>
        link.some((id) => path.some((pathId) => pathId === id)),
      )
      if (middlePath) {
        paths.push(
          middlePath.slice(0, middlePath.indexOf(link[0])).concat(link),
        )
      } else {
        paths.push([...link])
      }
    }
    return paths
  }, [])
}

const assignSlots = ({ commits, parentNodes, links }) => {
  let paths = reducePaths({ links })
  let orderedPaths = getOrderedPaths(paths)

  commits.sort(function (a, b) {
    return descending(new Date(a.date), new Date(b.date))
  })

  commits.forEach((commit) => {
    orderedPaths.some((orderedPath, i) => {
      if (orderedPath.indexOf(commit.id) > -1) {
        commit.data.slotIndex = orderedPaths.length - 1 - i
        return true
      }
    })
  })
}
