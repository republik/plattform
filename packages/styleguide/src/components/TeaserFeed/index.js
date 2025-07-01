import Container from './Container'
import * as Headlines from './Headline'
import InternalOnlyTag from './InternalOnlyTag'
import Lead from './Lead'
import Credit from './Credit'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { renderMdast, matchType } from '@republik/mdast-react-render'
import { timeFormat } from '../../lib/timeFormat'
import { Editorial } from '../Typography'
import Highlight from './Highlight'

const dateFormat = timeFormat('%d.%m.%Y')

const styles = {
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
}

const br = {
  matchMdast: matchType('break'),
  component: () => <br />,
  isVoid: true,
}

function getLinkRule(isInteractive) {
  return {
    matchMdast: matchType('link'),
    props: (node) => ({
      title: node.title,
      href: isInteractive ? node.url : undefined,
    }),
    component: isInteractive
      ? Editorial.A
      : ({ children }) => <span>{children}</span>,
  }
}

function getCreditsSchema(isInteractive = true) {
  return {
    rules: [getLinkRule(isInteractive), br],
  }
}

const DefaultLink = ({ children, href }) => children

export const TeaserFeed = ({
  kind: metaKind,
  color: metaColor,
  template,
  format,
  path,
  repoId,
  title,
  description,
  highlight,
  highlightLabel,
  credits,
  publishDate,
  prepublication,
  bar,
  t,
  Link = DefaultLink,
  menu,
  highlighted,
  series,
  dense = false,
  nonInteractive = false,
  skipFormat = false,
}) => {
  const formatMeta = (format && format.meta) || {}

  const Headline =
    formatMeta.kind === 'meta' ||
    metaKind === 'meta' ||
    template === 'section' ||
    template === 'format' ||
    template === 'page'
      ? Headlines.Interaction
      : formatMeta.kind === 'scribble' || metaKind === 'scribble'
      ? Headlines.Scribble
      : formatMeta.kind === 'flyer'
      ? Headlines.Flyer
      : Headlines.Editorial
  const borderColor = formatMeta.title
    ? formatMeta.color || colors[formatMeta.kind]
    : template === 'format'
    ? metaColor || colors[metaKind]
    : undefined
  const titleColor = metaColor
    ? metaColor
    : template === 'format'
    ? borderColor
    : undefined

  const showCredits = credits && credits.length > 0
  const hidePublishDate = ['section', 'format'].includes(template)

  return (
    <Container
      highlighted={highlighted}
      format={skipFormat ? undefined : format}
      series={series}
      formatColor={skipFormat ? undefined : borderColor}
      Link={Link}
      menu={menu}
      repoId={repoId}
      href={path}
      title={title}
      dense={dense}
      nonInteractive={nonInteractive}
    >
      <Headline formatColor={titleColor}>
        {!nonInteractive ? (
          <Link href={path} passHref>
            <a {...styles.link} href={path}>
              {title}
            </a>
          </Link>
        ) : (
          title
        )}
      </Headline>
      {!!description && formatMeta.kind !== 'flyer' && (
        <Lead>
          {!nonInteractive ? (
            <Link href={path} passHref>
              <a {...styles.link} href={path}>
                {description}
              </a>
            </Link>
          ) : (
            description
          )}
        </Lead>
      )}
      {showCredits && (
        <Credit>
          {renderMdast(credits, getCreditsSchema(!nonInteractive))}
        </Credit>
      )}
      {!showCredits && !hidePublishDate && !!publishDate && (
        <Credit>{dateFormat(new Date(publishDate))}</Credit>
      )}
      {!!highlight && (
        <Highlight label={highlightLabel}>
          <Link href={path} passHref>
            <a {...styles.link} href={path}>
              {highlight}
            </a>
          </Link>
        </Highlight>
      )}
      {bar && bar}
      {prepublication && <InternalOnlyTag t={t} />}
    </Container>
  )
}
