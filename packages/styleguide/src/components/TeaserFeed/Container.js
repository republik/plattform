import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Format } from './Format'
import CalloutMenu from '../Callout/CalloutMenu'
import { MoreIcon } from '../Icons'
import { useColorContext } from '../Colors/useColorContext'
import IconButton from '../IconButton'
import { getFormatLine } from './utils'

const styles = {
  main: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 8,
    paddingBottom: 30,
    position: 'relative',
    margin: 0,
    [mUp]: {
      paddingBottom: 40,
      paddingTop: '10px',
    },
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
}

const MoreIconWithProps = (props) => (
  <IconButton title='Mehr' Icon={MoreIcon} {...props} />
)

const Teaser = ({
  children,
  formatColor,
  format,
  series,
  repoId,
  title,
  href,
  Link,
  highlighted,
  menu,
}) => {
  const [colorScheme] = useColorContext()

  const formatLine = getFormatLine({
    format,
    series,
    repoId,
    path: href,
    title,
  })

  return (
    <div
      {...styles.main}
      {...colorScheme.set('borderColor', formatColor || 'text', 'format')}
      {...(highlighted && colorScheme.set('backgroundColor', 'alert'))}
    >
      {menu && (
        <div
          style={{
            float: 'right',
          }}
        >
          <CalloutMenu Element={MoreIconWithProps} align='right'>
            {menu}
          </CalloutMenu>
        </div>
      )}
      {formatLine.title && (
        <Format color={formatColor}>
          <Link href={formatLine.path} passHref>
            <a {...styles.link} href={formatLine.path}>
              {formatLine.title}
            </a>
          </Link>
        </Format>
      )}
      {children}
    </div>
  )
}

Teaser.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  format: PropTypes.object,
  interaction: PropTypes.bool,
  Link: PropTypes.func.isRequired, // a react component
}

export default Teaser
