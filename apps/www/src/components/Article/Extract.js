import { Children, Fragment } from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { renderMdast } from '@republik/mdast-react-render'
import { withEditor } from '../Auth/checkRoles'

// convert string into array of slice arguments, see tests
export const parseSliceRanges = (ranges) =>
  ranges.split(':').map((range) => {
    let [start, end] = range.split('...')
    start = +start || 0

    if (end === '') {
      end = undefined
    } else if (end === undefined) {
      end = start + 1
    } else {
      end = +end
    }

    return [start, end]
  })

const Extract = ({ schema, mdast, ranges, unpack, isEditor }) => {
  const sliceNode = (tree, [[start, end], ...childRanges]) => {
    const children = tree.children.slice(start, end)

    return {
      ...tree,
      children: childRanges.length
        ? children.map((child) => sliceNode(child, childRanges))
        : children,
    }
  }

  const part = sliceNode(mdast, parseSliceRanges(ranges))

  const unpackChildren = (children, level) => {
    if (level > 0) {
      return Children.toArray(children)
        .map((child) => unpackChildren(child.props.children, level - 1))
        .reduce((all, someChildren) => all.concat(someChildren), [])
    }
    return children
  }
  const MissingNode = isEditor ? undefined : ({ children }) => children
  const children = unpackChildren(
    renderMdast(part, schema, { MissingNode }),
    +unpack,
  )

  return (
    <Fragment>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      {children}
    </Fragment>
  )
}

Extract.propTypes = {
  schema: PropTypes.object.isRequired,
  mdast: PropTypes.object.isRequired,
  ranges: PropTypes.string.isRequired,
  unpack: PropTypes.string,
  isEditor: PropTypes.bool,
}

export default withEditor(Extract)
