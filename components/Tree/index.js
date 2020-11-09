import React, { Component } from 'react'
import { css } from 'glamor'
import LocalIcon from 'react-icons/lib/md/lock-open'
import CheckIcon from 'react-icons/lib/md/check'
import TagIcon from 'react-icons/lib/md/grade'
import { Interaction, Label } from '@project-r/styleguide'
import { lab } from 'd3-color'
import { Link } from '../../lib/routes'
import withT from '../../lib/withT'
import { swissTime } from '../../lib/utils/format'
import { transformData } from './transformData'

import GithubIcon from 'react-icons/lib/fa/github'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const CONTAINER_MAX_WIDTH = 800
const NODE_SIZE = 12
const NODE_SIZE_HOVER = 16
const LIST_MIN_WIDTH = 300
const MILESTONEICON_SIZE = 16

const styles = {
  container: css({
    maxWidth: `${CONTAINER_MAX_WIDTH}px`,
    margin: '0 auto',
    padding: '0 10px',
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
    zIndex: 2,
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
    position: 'relative'
  }),
  listItemWrapper: css({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }),
  svg: css({
    position: 'absolute',
    top: 0,
    zIndex: 1
  }),
  checkIcon: {
    backgroundColor: '#fff',
    margin: `0 5px 1px -${MILESTONEICON_SIZE + 6}px`
  },
  milestoneLabel: css({
    fontWeight: 'bold'
  }),
  milestone: css({
    display: 'block',
    paddingLeft: `${MILESTONEICON_SIZE + 6}px`
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
    ':hover': {
      color: '#000'
    }
  })
}

class Tree extends Component {
  constructor(props) {
    super(props)
    this.colors = new Map()
    this.state = {
      commits: null,
      links: null,
      parentNodes: null
    }
    this.measure = this.measure.bind(this)
  }

  UNSAFE_componentWillMount() {
    this.setState(() => transformData(this.props))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(() => transformData(nextProps))
  }

  componentDidUpdate() {
    if (!this.state.width) {
      this.measure()
    } else {
      this.measure()
      this.layout()
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.measure)
    this.measure()
  }

  measure() {
    const { commits, numSlots } = this.state

    if (!commits || !this.containerRef) return
    const containerRect = this.containerRef.getBoundingClientRect()

    commits.forEach(({ data, listItemRef }) => {
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

    const slotWidth = Math.max(
      NODE_SIZE / 2 + 2,
      Math.min(
        20,
        Math.floor((width - Math.max(width / 2, LIST_MIN_WIDTH)) / numSlots)
      )
    )
    if (slotWidth !== this.state.slotWidth) {
      this.setState({ slotWidth })
    }
  }

  getColor(hash) {
    if (this.colors.has(hash)) {
      return this.colors.get(hash)
    }
    const { colors } = this.state
    const color = colors(hash)
    let backgroundColor = lab(color)
    backgroundColor.opacity = 0.2
    backgroundColor = backgroundColor.toString()
    let highlightColor = lab(color)
    highlightColor.opacity = 0.3
    highlightColor = highlightColor.toString()
    const res = { color, backgroundColor, highlightColor }
    this.colors.set(hash, res)
    return res
  }

  layout() {
    const { slotWidth } = this.state

    this.state.commits.forEach(({ data, author, nodeRef, milestones }, i) => {
      nodeRef.style.left = `${data.slotIndex * slotWidth + slotWidth / 2}px`
      nodeRef.style.top = `${data.measurements.top +
        Math.floor(data.measurements.height / 2)}px`
    })

    // Draw connections.
    const adjustment = NODE_SIZE / 2
    this.state.links.forEach(({ sourceId, destinationId, ref }) => {
      let source = this.state.commits.filter(o => {
        return o.id === sourceId
      })[0]
      let destination = this.state.commits.filter(o => {
        return o.id === destinationId
      })[0]
      if (!source || !destination) {
        return
      }

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

  render() {
    const { repoId, isTemplate, t, localStorageCommitIds = [] } = this.props
    const { width, height, slotWidth, commits, links, numSlots } = this.state

    const paddingLeft = slotWidth ? numSlots * slotWidth + NODE_SIZE : 0

    return (
      <div
        {...styles.container}
        style={{
          maxWidth: Math.max(
            CONTAINER_MAX_WIDTH,
            CONTAINER_MAX_WIDTH / 2 + paddingLeft
          )
        }}
        ref={ref => {
          this.containerRef = ref
        }}
      >
        {slotWidth && (
          <svg
            style={{
              height,
              width: numSlots * slotWidth,
              left: slotWidth / 2
            }}
            {...styles.svg}
          >
            {links &&
              links.map((path, i) => (
                <path key={i} strokeWidth='1' stroke='#000' ref={path.setRef} />
              ))}
          </svg>
        )}

        {commits && (
          <ul {...styles.list}>
            {commits.map(commit => {
              const treeColors = this.getColor(commit.author.email)
              const hasLocalVersion =
                localStorageCommitIds.indexOf(commit.id) !== -1
              const hightlight = hasLocalVersion || commit.milestones.length
              return (
                <li
                  key={commit.id}
                  ref={commit.setListItemRef}
                  style={{
                    backgroundColor: hightlight
                      ? treeColors.highlightColor
                      : undefined,
                    paddingLeft
                  }}
                  {...styles.listItem}
                >
                  <div
                    style={{
                      padding: 5,
                      backgroundColor: !hightlight
                        ? treeColors.backgroundColor
                        : undefined
                    }}
                    {...styles.listItemWrapper}
                  >
                    <div>
                      <Interaction.P>
                        <Link
                          route='repo/edit'
                          params={{
                            repoId: repoId.split('/'),
                            commitId: commit.id
                          }}
                        >
                          <a {...styles.link}>{commit.message}</a>
                        </Link>
                      </Interaction.P>
                      <Label>
                        {commit.author.name}
                        <br />
                        {timeFormat(new Date(commit.date))}
                      </Label>
                      <br />
                      <br />
                      {hasLocalVersion && (
                        <span {...styles.milestone}>
                          <LocalIcon
                            color='#000'
                            size={MILESTONEICON_SIZE}
                            style={styles.checkIcon}
                          />
                          <span {...styles.milestoneLabel}>
                            {t('tree/commit/localVersion')}
                          </span>
                        </span>
                      )}
                      {commit.milestones.map((milestone, i) => (
                        <span {...styles.milestone} key={i}>
                          {milestone.immutable ? (
                            <TagIcon
                              color='#000'
                              size={MILESTONEICON_SIZE}
                              style={styles.checkIcon}
                            />
                          ) : (
                            <CheckIcon
                              color='#000'
                              size={MILESTONEICON_SIZE}
                              style={styles.checkIcon}
                            />
                          )}
                          <span {...styles.milestoneLabel}>
                            {t(
                              `checklist/labels/${milestone.name}`,
                              undefined,
                              milestone.name
                            )}{' '}
                          </span>
                          {milestone.author.name}
                        </span>
                      ))}
                      {!isTemplate && (
                        <Interaction.P>
                          <Label>
                            <Link
                              route='repo/publish'
                              params={{
                                repoId: repoId.split('/'),
                                commitId: commit.id
                              }}
                            >
                              <a {...styles.link}>{t('tree/commit/publish')}</a>
                            </Link>
                          </Label>
                        </Interaction.P>
                      )}
                    </div>
                    <div style={{ marginRight: 10 }}>
                      <Interaction.P>
                        <Label style={{ fontSize: 20 }}>
                          {/* short_path=75b25ca opens the rich-diff for files named article.md.
                            still not sure how it's constructed though */}
                          <a
                            href={`https://github.com/${repoId}/commit/${commit.id}?short_path=75b25ca`}
                            target='_blank'
                            {...styles.link}
                          >
                            <GithubIcon />
                          </a>
                        </Label>
                      </Interaction.P>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {width &&
          commits &&
          commits.map(commit => {
            return (
              <span
                key={commit.id}
                ref={commit.setNodeRef}
                style={{
                  backgroundColor: this.getColor(commit.author.email).color
                }}
                {...styles.commitNode}
              >
                <Link
                  route='repo/edit'
                  params={{
                    repoId: repoId.split('/'),
                    commitId: commit.id
                  }}
                >
                  <a {...css(styles.nodeLink)} />
                </Link>
              </span>
            )
          })}
      </div>
    )
  }
}

export default withT(Tree)
