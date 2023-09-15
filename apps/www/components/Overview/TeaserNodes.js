import { Fragment } from 'react'
import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'
import Link from 'next/link'

const styles = {
  area: css({
    display: 'block',
    position: 'absolute',
    top: 0,
    bottom: 0,
    transition: 'background-color 400ms',
  }),
}

const TeaserNodes = ({ nodes, highlight, noClick, backgroundColor }) => {
  const nodeWidth = 100 / nodes.length
  const maxIndex = nodes.length - 1
  const [colorScheme] = useColorContext()

  return (
    <Fragment>
      {nodes.map((node, i) => {
        const area = (
          <a
            key={node.data.id}
            {...styles.area}
            style={{
              left: `${nodeWidth * i}%`,
              right: `${nodeWidth * (maxIndex - i)}%`,
              opacity: highlight && !highlight(node.data) ? '0.6' : '0',
              backgroundColor,
            }}
            {...colorScheme.set('backgroundColor', 'default')}
          />
        )
        if (node.data.url && !noClick) {
          return (
            <Link
              key={node.data.id}
              href={node.data.url}
              passHref
              legacyBehavior
            >
              {area}
            </Link>
          )
        }
        return area
      })}
    </Fragment>
  )
}

export default TeaserNodes
