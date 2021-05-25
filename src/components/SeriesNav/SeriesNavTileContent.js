import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

import {
  serifTitle16,
  serifTitle20,
  serifRegular15,
  serifRegular17,
  sansSerifRegular14,
  sansSerifRegular12
} from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import { FigureImage } from '../Figure'

const styles = {
  title: css({
    ...serifTitle16,
    [mUp]: {
      ...serifTitle20
    }
  }),
  titleInline: css({
    ...serifTitle16
  }),
  lead: css({
    ...serifRegular15,
    [mUp]: {
      ...serifRegular17
    }
  }),
  label: css({
    marginTop: 0,
    ...sansSerifRegular12,
    [mUp]: {
      ...sansSerifRegular14
    }
  }),
  plainlink: css({
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer'
  })
}

const DefaultLink = ({ children }) => children

const SeriesNavTileContent = ({
  inline,
  episode,
  current,
  ActionBar,
  Link = DefaultLink
}) => {
  const [colorScheme] = useColorContext()
  const imageProps = inline
    ? episode.image &&
      FigureImage.utils.getResizedSrcs(episode.image, 300, true)
    : episode.image &&
      FigureImage.utils.getResizedSrcs(episode.image, 600, true)
  const isLink = episode.document.meta.path && episode.isReadable && !current

  const LinkContainer = ({ children }) =>
    isLink ? (
      <Link href={episode.document.meta.path} passHref>
        <a {...styles.plainlink}>{children}</a>
      </Link>
    ) : (
      <>{children}</>
    )

  if (inline) {
    return (
      <LinkContainer>
        <p {...styles.label} {...colorScheme.set('color', 'text')}>
          {current ? 'Sie lesen: ' : null}
          {episode.label}
        </p>
        <FigureImage
          {...imageProps}
          //TODO proper alt image text
          alt={episode.title}
        />

        <h2 {...styles.titleInline} {...colorScheme.set('color', 'text')}>
          {episode.title}
        </h2>
      </LinkContainer>
    )
  }

  return (
    <>
      <LinkContainer>
        <p {...styles.label} {...colorScheme.set('color', 'text')}>
          {current ? 'Sie lesen: ' : null}
          {episode.label}
        </p>
        <FigureImage
          {...imageProps}
          //TODO proper alt image text
          alt={episode.title}
        />

        <h2 {...styles.title} {...colorScheme.set('color', 'text')}>
          {episode.title}
        </h2>
        <p {...styles.lead} {...colorScheme.set('color', 'text')}>
          {episode.lead}
        </p>
      </LinkContainer>

      <ActionBar mode='bookmark' document={episode} />
    </>
  )
}

export default SeriesNavTileContent
