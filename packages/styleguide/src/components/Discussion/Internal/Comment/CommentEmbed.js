import React from 'react'
import * as Interaction from '../../../../components/Typography/Interaction'
import { css } from 'glamor'
import {
  sansSerifRegular13,
  sansSerifRegular15,
  sansSerifMedium16,
  sansSerifMedium18,
} from '../../../Typography/styles'
import { mUp } from '../../../../theme/mediaQueries'
import { linkStyle } from '../../../Typography'
import { useColorContext } from '../../../Colors/ColorContext'
import { timeFormat } from '../../../../lib/timeFormat'
import PropTypes from 'prop-types'
import { IconLogoTwitter } from '@republik/icons'

const styles = {
  link: css({
    textDecoration: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }),
  container: css({
    borderWidth: 1,
    borderStyle: 'solid',
    position: 'relative',
    marginTop: 15,
    [mUp]: {
      marginTop: 0,
    },
  }),
  imageContainer: css({}),
  image: css({
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    width: '100%',
  }),
  text: css({
    marginTop: 3,
    padding: '0.1rem 10px 10px 10px',
    zIndex: 1,
    pointerEvents: 'none',
    position: 'relative',
    overflowX: 'hidden',
  }),
  siteImage: css({
    width: 19,
    height: 19,
    marginRight: 5,
    marginBottom: 3,
    verticalAlign: 'middle',
  }),
  paragraph: css({
    marginTop: '0.3rem',
    ...sansSerifRegular13,
    [mUp]: {
      ...sansSerifRegular15,
    },
    '& a': {
      ...linkStyle,
      pointerEvents: 'all',
    },
  }),
  title: css({
    margin: '0.3rem 0 0.5rem 0',
    ...sansSerifMedium16,
    [mUp]: {
      ...sansSerifMedium18,
      lineHeight: '1.4rem',
    },
    lineHeight: '1.4rem',
  }),
  topStory: css({
    position: 'absolute',
    top: -10,
    right: -10,
    color: 'red',
    textTransform: 'uppercase',
  }),
}

const dateFormat = timeFormat('%d.%m.%Y %H:%M')

const normalizeEmbed = (embed) => ({
  ...embed,
  imageUrl: embed?.imageUrl ?? embed?.image,
  header: embed?.siteName ?? embed?.userName,
  headerImageUrl: embed?.siteImageUrl ?? embed?.userProfileImageUrl,
  html:
    embed?.__typename === 'TwitterEmbed' &&
    embed?.html &&
    embed?.html.replace(/\s*target="_blank"/g, ''),
  body: embed?.description,
})

const propTypes = {
  embed: PropTypes.object.isRequired,
  mentioningDocument: PropTypes.object,
}

export const CommentEmbed = ({ embed, mentioningDocument }) => {
  const [colorScheme] = useColorContext()
  const { url, title, imageUrl, header, headerImageUrl, body, html, imageAlt } =
    normalizeEmbed(embed)

  return (
    <div {...styles.container} {...colorScheme.set('borderColor', 'divider')}>
      <a href={url} {...styles.link}></a>
      <div {...styles.imageContainer}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={imageAlt || title}
            {...styles.image}
            {...colorScheme.set('borderColor', 'divider')}
          />
        )}
        {mentioningDocument && (
          <div {...styles.topStory}>
            <a
              href={[
                mentioningDocument.document.meta.path,
                mentioningDocument.fragmentId,
              ]
                .filter(Boolean)
                .join('#')}
            >
              <img
                src={mentioningDocument.iconUrl}
                alt=''
                width={125}
                height={125}
              />
            </a>
          </div>
        )}
      </div>
      <div {...styles.text}>
        {header && (
          <Interaction.P {...styles.paragraph}>
            {headerImageUrl && (
              <img src={headerImageUrl} alt='' {...styles.siteImage} />
            )}
            <strong>{header}</strong>{' '}
            {embed?.userScreenName && ` @${embed.userScreenName}`}
          </Interaction.P>
        )}
        {title && <Interaction.P {...styles.title}>{title}</Interaction.P>}
        {html && (
          <Interaction.P
            {...styles.paragraph}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        {!html && body && (
          <Interaction.P {...styles.paragraph}>{body}</Interaction.P>
        )}
        {embed?.userScreenName && (
          <Interaction.P {...styles.paragraph}>
            <IconLogoTwitter size={19} {...colorScheme.set('fill', 'disabled')} />{' '}
            {dateFormat(new Date(embed.createdAt))}
          </Interaction.P>
        )}
      </div>
    </div>
  )
}

CommentEmbed.propTypes = propTypes
