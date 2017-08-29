import React, { Component } from 'react'
import { Link } from '../../lib/routes'
import { css } from 'glamor'
import { ascending, descending } from 'd3-array'
import { swissTime } from '../../lib/utils/format'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const SLOT_WIDTH = 20
const NODE_SIZE = 10
const LIST_WIDTH = 250

const styles = {
  container: css({
    margin: '0 auto',
    position: 'relative'
  }),
  commitNode: css({
    backgroundColor: '#000',
    borderRadius: `${NODE_SIZE}px`,
    display: 'block',
    height: `${NODE_SIZE}px`,
    position: 'absolute',
    width: `${NODE_SIZE}px`
  }),
  nodeLink: {
    display: 'inline-block',
    height: `${NODE_SIZE}px`,
    position: 'absolute',
    width: `${NODE_SIZE}px`
  },
  list: css({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    width: `${LIST_WIDTH}px`,
    zIndex: 1
  }),
  listItem: css({
    fontSize: '12px',
    marginBottom: '10px'
  }),
  svg: css({
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1
  })
}

export default class Tree extends Component {
  constructor (props) {
    super(props)
    this.state = {
      commits: null,
      links: null,
      parentNodes: null
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState(() => this.transformData(nextProps))
  }

  componentDidUpdate () {
    if (!this.state.width) {
      this.measure()
    } else {
      this.layout()
    }
  }

  transformData (props) {
    let commits = props.commits
      .map(commit => {
        return {
          id: commit.id,
          date: commit.date,
          author: commit.author,
          message: commit.message,
          parentIds: commit.parentIds
        }
      })
      .sort(function (a, b) {
        return ascending(new Date(a.date), new Date(b.date))
      })

    let parentNodes = new Map()
    let links = []
    let commit
    let children

    for (let i = 0; i < commits.length; i++) {
      commit = commits[i]
      if (!commit.parentIds) continue
      for (let j = 0; j < commit.parentIds.length; j++) {
        children = []
        if (parentNodes.has(commit.parentIds[j])) {
          children = [...parentNodes.get(commit.parentIds[j])]
        }
        if (!children.indexOf(commit.id) === -1) {
          continue
        }
        children.push(commit.id)
        parentNodes.set(commit.parentIds[j], children)
        links.push({
          sourceId: commit.parentIds[j],
          destinationId: commit.id
        })
      }
    }

    commits.forEach(commit => {
      commit.setListItemRef = ref => {
        commit.listItemRef = ref
      }
      commit.setNodeRef = ref => {
        commit.nodeRef = ref
      }
      commit.data = {
        slotIndex: null
      }
    })

    links.forEach(link => {
      link.setRef = ref => {
        link.ref = ref
      }
    })

    assignSlots(commits, parentNodes)

    return {
      commits: commits,
      links: links,
      parentNodes: parentNodes
    }
  }

  measure () {
    const { commits } = this.state

    if (!commits) return

    const containerRect = this.containerRef.getBoundingClientRect()

    commits.forEach(({ data, listItemRef }) => {
      listItemRef.style.removeProperty('position')
      listItemRef.style.removeProperty('left')
      listItemRef.style.removeProperty('top')
      const rect = listItemRef.getBoundingClientRect()
      data.measurements = {
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        top: Math.ceil(rect.top - containerRect.top),
        left: Math.ceil(rect.left - containerRect.left)
      }
    })

    const width = containerRect.width
    const height = containerRect.height
    if (width !== this.state.width) {
      this.setState({ width: width })
    }
    if (height !== this.state.height) {
      this.setState({ height: height })
    }
  }

  layout () {
    let numSlots = Math.max.apply(
      Math,
      this.state.commits.map(function (o) {
        return o.data.slotIndex + 1
      })
    )

    const svgWidth = numSlots * SLOT_WIDTH
    this.svgRef.style.height = `${this.state.height}px`
    this.svgRef.style.width = `${svgWidth}px`
    this.listRef.style.marginLeft = `${svgWidth + NODE_SIZE}px`
    this.containerRef.style.width = `${svgWidth + LIST_WIDTH}px`

    this.state.commits.forEach(({ data, nodeRef }) => {
      nodeRef.style.left = `${data.slotIndex * SLOT_WIDTH}px`
      nodeRef.style.top = `${data.measurements.top}px`
    })

    const adjustment = NODE_SIZE / 2
    this.state.links.forEach(({ sourceId, destinationId, ref }) => {
      let source = this.state.commits.filter(o => {
        return o.id === sourceId
      })[0]
      let destination = this.state.commits.filter(o => {
        return o.id === destinationId
      })[0]

      const sx = source.data.slotIndex * SLOT_WIDTH + adjustment
      const sy = source.data.measurements.top + adjustment
      const dx = destination.data.slotIndex * SLOT_WIDTH + adjustment
      const dy = destination.data.measurements.top + adjustment
      const startPoint = `${sx} ${sy}`
      const endPoint = `${dx} ${dy}`

      let description =
        destination.data.slotIndex === source.data.slotIndex
          ? `M${startPoint} ${endPoint}`
          : destination.parentIds.length < 2
            ? `M${startPoint} ${dx} ${sy} M${dx} ${sy} ${endPoint}`
            : `M${startPoint} ${sx} ${dy} M${sx} ${dy} ${endPoint}`
      ref.setAttribute('d', description)
    })
  }

  render () {
    const { repository } = this.props
    const { width, commits, links } = this.state

    return (
      <div
        {...styles.container}
        ref={ref => {
          this.containerRef = ref
        }}
      >
        <svg
          ref={ref => {
            this.svgRef = ref
          }}
          {...styles.svg}
        >
          {width &&
            links &&
            links.map((path, i) =>
              <path key={i} strokeWidth='1' stroke='#000' ref={path.setRef} />
            )}
        </svg>

        {commits &&
          <ul
            {...styles.list}
            ref={ref => {
              this.listRef = ref
            }}
          >
            {commits.map(commit =>
              <li
                key={commit.id}
                ref={commit.setListItemRef}
                {...styles.listItem}
              >
                <Link
                  route='editor/edit'
                  params={{
                    repository: repository,
                    commit: commit.id
                  }}
                >
                  <a>
                    {commit.message}
                  </a>
                </Link>
                <br />
                {commit.author.name}
                <br />
                {timeFormat(new Date(commit.date))}
              </li>
            )}
          </ul>}

        {width &&
          commits &&
          commits.map(commit =>
            <span
              key={commit.id}
              ref={commit.setNodeRef}
              {...styles.commitNode}
            >
              <Link
                route='editor/edit'
                params={{
                  repository: repository,
                  commit: commit.id
                }}
              >
                <a {...css(styles.nodeLink)} />
              </Link>
            </span>
          )}
      </div>
    )
  }
}

const getPaths = (commits, parentNodes) => {
  // Walks and collects all possible upward paths on the tree.
  let paths = []
  let pathsToWalk = [[commits[0].id]]

  do {
    let path = pathsToWalk[0]
    let nextId = path.pop()
    do {
      let children = parentNodes.get(nextId)
      path.push(nextId)
      nextId = null
      if (children && !!children.length) {
        nextId = children.pop()
        for (let i = 0; i < children.length; i++) {
          pathsToWalk.push([...path, children[i]])
        }
      }
    } while (nextId)
    paths.push(path)
    pathsToWalk.shift()
  } while (pathsToWalk.length)

  return paths
}

const getOrderedPaths = paths => {
  // TODO: More sophisticated ordering.
  return paths.sort(function (a, b) {
    return descending(a.length, b.length)
  })
}

const assignSlots = (commits, parentNodes) => {
  let paths = getPaths(commits, parentNodes)
  let orderedPaths = getOrderedPaths(paths)
  commits.sort(function (a, b) {
    return descending(new Date(a.date), new Date(b.date))
  })

  for (let i = 0; i < commits.length; i++) {
    let commit = commits[i]
    let found = false
    for (let j = 0; j < orderedPaths.length; j++) {
      if (!found && orderedPaths[j].indexOf(commit.id) > -1) {
        commit.data.slotIndex = orderedPaths.length - 1 - j
        break
      }
    }
  }
}
