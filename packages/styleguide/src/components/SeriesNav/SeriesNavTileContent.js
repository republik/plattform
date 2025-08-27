import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

import {
  serifTitle16,
  serifTitle20,
  serifRegular15,
  serifRegular17,
  sansSerifRegular14,
  sansSerifRegular12,
  sansSerifMedium14,
  sansSerifMedium12,
} from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import { FigureImage } from '../Figure'

const styles = {
  title: css({
    ...serifTitle16,
    marginBlock: '0.8em',
    [mUp]: {
      ...serifTitle20,
    },
  }),
  titleInline: css({
    ...serifTitle16,
    marginBottom: 0,
    marginTop: 12,
  }),
  lead: css({
    ...serifRegular15,
    [mUp]: {
      ...serifRegular17,
    },
  }),
  label: css({
    marginTop: 0,
    marginBottom: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  labelRegular: css({
    ...sansSerifRegular12,
    [mUp]: {
      ...sansSerifRegular14,
    },
  }),
  labelMedium: css({
    ...sansSerifMedium12,
    [mUp]: {
      ...sansSerifMedium14,
    },
  }),
  plainlink: css({
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  }),
}

const DefaultLink = ({ children }) => children

const SeriesNavTileContent = ({
  t,
  inline,
  episode,
  current,
  ActionBar,
  Link = DefaultLink,
  onEpisodeClick,
  aboveTheFold,
}) => {
  const [colorScheme] = useColorContext()
  const maxImageWidth = inline ? 300 : 600
  const imageProps =
    episode.image &&
    FigureImage.utils.getResizedSrcs(
      episode.image,
      undefined,
      maxImageWidth,
      true,
    )

  const isLink = episode.document && episode.document?.meta?.path && !current

  const LinkContainer = ({ children }) =>
    isLink ? (
      <Link
        href={episode.document.meta.path}
        {...styles.plainlink}
        onClick={onEpisodeClick}
        legacyBehavior={false}
      >
        {children}
      </Link>
    ) : (
      <>{children}</>
    )

  if (inline) {
    return (
      <LinkContainer>
        <p
          {...styles.label}
          {...(current ? styles.labelMedium : styles.labelRegular)}
          {...colorScheme.set('color', 'text')}
        >
          {current ? `${t('styleguide/SeriesNav/current')} ` : ''}
          {episode.label}
        </p>
        {imageProps ? (
          <FigureImage aboveTheFold={aboveTheFold} {...imageProps} alt='' />
        ) : null}
        <h2 {...styles.titleInline} {...colorScheme.set('color', 'text')}>
          {episode.title}
        </h2>
      </LinkContainer>
    )
  }

  return (
    <>
      <LinkContainer>
        <p
          {...styles.label}
          {...(current ? styles.labelMedium : styles.labelRegular)}
          {...colorScheme.set('color', 'text')}
        >
          {current ? 'Sie lesen: ' : ''}
          {episode.label}
        </p>
        {imageProps ? (
          <FigureImage aboveTheFold={aboveTheFold} {...imageProps} alt='' />
        ) : null}
        <h2 {...styles.title} {...colorScheme.set('color', 'text')}>
          {episode.title}
        </h2>
        <p {...styles.lead} {...colorScheme.set('color', 'text')}>
          {episode.lead}
        </p>
      </LinkContainer>
      {!!episode.document && !!ActionBar && (
        <ActionBar mode='seriesEpisode' document={episode.document} />
      )}
    </>
  )
}

export default React.memo(SeriesNavTileContent)
