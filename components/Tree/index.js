import React, { Component } from 'react'
import { Link } from '../../lib/routes'
import { css } from 'glamor'
import { ascending, descending, max } from 'd3-array'
import { schemeCategory10 } from 'd3-scale'
import { color as d3Color } from 'd3-color'
import CheckIcon from 'react-icons/lib/md/check'
import withT from '../../lib/withT'
import { swissTime } from '../../lib/utils/format'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const CONTAINER_MAX_WIDTH = 800
const MIN_PADDING = 10
const NODE_SIZE = 12
const NODE_SIZE_HOVER = 16
const LIST_MIN_WIDTH = 250
const CHECKICON_SIZE = 16

const styles = {
  container: css({
    maxWidth: `${CONTAINER_MAX_WIDTH}px`,
    overflow: 'hidden',
    position: 'relative',
    paddingTop: 20
  }),
  commitNode: css({
    backgroundColor: '#000',
    borderRadius: `${NODE_SIZE}px`,
    cursor: 'pointer',
    display: 'block',
    height: `${NODE_SIZE}px`,
    position: 'absolute',
    width: `${NODE_SIZE}px`,
    ':hover': {
      margin: `-${(NODE_SIZE_HOVER - NODE_SIZE) / 2}px 0 0 -${(NODE_SIZE_HOVER -
        NODE_SIZE) /
        2}px`,
      height: `${NODE_SIZE_HOVER}px`,
      width: `${NODE_SIZE_HOVER}px`
    }
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
    minWidth: `${LIST_MIN_WIDTH}px`,
    zIndex: 1
  }),
  listItem: css({
    fontSize: '13px',
    marginBottom: '5px',
    padding: '5px',
    position: 'relative'
  }),
  svg: css({
    position: 'absolute',
    top: 0,
    zIndex: -1
  }),
  checkIcon: {
    backgroundColor: '#fff',
    margin: `0 5px 1px -${CHECKICON_SIZE + 6}px`
  },
  milestoneBar: css({
    backgroundColor: '#ddd',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: '-2'
  }),
  milestoneInfo: css({
    display: 'block',
    marginBottom: '5px'
  }),
  milestoneLabel: css({
    fontWeight: 'bold'
  }),
  milestone: css({
    display: 'block',
    paddingLeft: `${CHECKICON_SIZE + 6}px`
  })
}

class Tree extends Component {
  constructor (props) {
    super(props)
    this.state = {
      commits: null,
      links: null,
      parentNodes: null
    }
    this.measure = this.measure.bind(this)
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

  componentDidMount () {
    window.addEventListener('resize', this.measure)
    this.measure()
  }

  transformData (props) {
    console.log(props.milestones)
    let commits = props.commits
      .map(commit => {
        return {
          id: commit.id,
          date: commit.date,
          author: commit.author,
          message: commit.message,
          parentIds: commit.parentIds,
          milestones: props.milestones.filter(o => {
            return o.commit.id === commit.id
          })
        }
      })
      .sort(function (a, b) {
        return ascending(new Date(a.date), new Date(b.date))
      })

    let parentNodes = new Map()
    let links = []

    commits.forEach(commit => {
      commit.setListItemRef = ref => {
        commit.listItemRef = ref
      }
      commit.setNodeRef = ref => {
        commit.nodeRef = ref
      }
      commit.setMilestoneBarRef = ref => {
        commit.milestoneBarRef = ref
      }
      commit.data = {
        slotIndex: null
      }
      if (!commit.parentIds) return
      commit.parentIds.forEach(parentId => {
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
          destinationId: commit.id
        })
      })
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

    if (!commits || !this.containerRef) return
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
    const windowWidth = window.innerWidth
    if (width !== this.state.width) {
      this.setState({ width: width })
    }
    if (height !== this.state.height) {
      this.setState({ height: height })
    }
    if (windowWidth !== this.state.windowWidth) {
      this.setState({ windowWidth: windowWidth })
    }
  }

  layout () {
    const { windowWidth, width } = this.state

    const numSlots = max(this.state.commits, o => o.data.slotIndex + 1)
    const slotWidth = Math.max(
      NODE_SIZE / 2 + 2,
      Math.min(
        80,
        Math.floor((width - Math.max(width / 2, LIST_MIN_WIDTH)) / numSlots)
      )
    )
    const svgWidth = numSlots * slotWidth

    this.svgRef.style.height = `${this.state.height}px`
    this.svgRef.style.width = `${svgWidth}px` - slotWidth / 2
    this.svgRef.style.left = slotWidth / 2
    this.listRef.style.marginLeft = `${svgWidth + NODE_SIZE}px`

    this.containerRef.style.margin =
      windowWidth < CONTAINER_MAX_WIDTH + 2 * MIN_PADDING
        ? `0 ${MIN_PADDING}px`
        : '0 auto 0'

    let colors = [...schemeCategory10]
    let authorColor = {}
    this.state.commits.forEach(
      ({ data, author, nodeRef, listItemRef, milestoneBarRef, milestones }) => {
        if (!authorColor[author.email]) {
          let color = colors.shift()
          let lightColor = d3Color(color)
          lightColor.opacity = 0.2
          authorColor[author.email] = {
            dark: color,
            light: lightColor.toString()
          }
        }
        nodeRef.style.left = `${data.slotIndex * slotWidth + slotWidth / 2}px`
        nodeRef.style.top = `${data.measurements.top +
          Math.floor(data.measurements.height / 2)}px`
        nodeRef.style.backgroundColor = authorColor[author.email].dark
        if (!milestoneBarRef) {
          listItemRef.style.backgroundColor = authorColor[author.email].light
        }
        if (milestoneBarRef) {
          milestoneBarRef.style.width = `${Math.max(width, LIST_MIN_WIDTH)}px`
        }
      }
    )

    const adjustment = NODE_SIZE / 2
    this.state.links.forEach(({ sourceId, destinationId, ref }) => {
      let source = this.state.commits.filter(o => {
        return o.id === sourceId
      })[0]
      let destination = this.state.commits.filter(o => {
        return o.id === destinationId
      })[0]

      const sx = source.data.slotIndex * slotWidth + adjustment
      const sy =
        source.data.measurements.top +
        Math.floor(source.data.measurements.height / 2) +
        adjustment
      const dx = destination.data.slotIndex * slotWidth + adjustment
      const dy =
        destination.data.measurements.top +
        Math.floor(destination.data.measurements.height / 2) +
        adjustment
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
    const { repository, t } = this.props
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
                {!!commit.milestones && commit.milestones.length > 0 &&
                <span>
                  <span {...styles.milestoneInfo}>
                    {commit.milestones.map((milestone, i) =>
                      <span {...styles.milestone} key={i}>
                        <CheckIcon
                          color='#000'
                          size={CHECKICON_SIZE}
                          style={styles.checkIcon}
                          />
                        <span {...styles.milestoneLabel}>{t(`checklist/labels/${milestone.name}`, undefined, milestone.name)}{' '}</span>
                        {milestone.author.name}: {milestone.message}
                      </span>
                      )}
                  </span>
                  <span
                    {...styles.milestoneBar}
                    ref={commit.setMilestoneBarRef}
                    />
                </span>}
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

export default withT(Tree)

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
        children.forEach(child => {
          pathsToWalk.push([...path, child])
        })
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

  commits.forEach(commit => {
    orderedPaths.some((orderedPath, i) => {
      if (orderedPath.indexOf(commit.id) > -1) {
        commit.data.slotIndex = orderedPaths.length - 1 - i
        return true
      }
    })
  })
}
