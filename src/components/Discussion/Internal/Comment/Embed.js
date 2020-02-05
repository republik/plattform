import React from 'react'
import * as Interaction from '../../../../components/Typography/Interaction'
import { css } from 'glamor'
import colors from '../../../../theme/colors'
import {
  sansSerifRegular13,
  sansSerifRegular15,
  sansSerifMedium16,
  sansSerifMedium18
} from '../../../Typography/styles'
import { mUp } from '../../../../theme/mediaQueries'
import { linkStyle } from '../../../Typography'
import TwitterIcon from 'react-icons/lib/fa/twitter'

import { timeFormat } from '../../../../lib/timeFormat'

const styles = {
  link: css({
    textDecoration: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }),
  container: css({
    border: `1px solid ${colors.divider}`,
    position: 'relative',
    marginTop: 15,
    [mUp]: {
      marginTop: 0
    }
  }),
  imageContainer: css({}),
  image: css({
    borderBottom: `1px solid ${colors.divider}`,
    width: '100%'
  }),
  text: css({
    marginTop: 3,
    padding: '0.1rem 10px 10px 10px',
    zIndex: 1,
    pointerEvents: 'none',
    position: 'relative'
  }),
  siteImage: css({
    width: 19,
    height: 19,
    marginRight: 5,
    marginBottom: 3,
    verticalAlign: 'middle'
  }),
  paragraph: css({
    marginTop: '0.3rem',
    ...sansSerifRegular13,
    [mUp]: {
      ...sansSerifRegular15
    },
    '& a': {
      ...linkStyle,
      pointerEvents: 'all'
    }
  }),
  title: css({
    margin: '0.3rem 0 0.5rem 0',
    ...sansSerifMedium16,
    [mUp]: {
      ...sansSerifMedium18,
      lineHeight: '1.4rem'
    },
    lineHeight: '1.4rem'
  }),
  topStory: css({
    position: 'absolute',
    top: -10,
    right: -10,
    color: 'red',
    textTransform: 'uppercase'
  })
}

const dateFormat = timeFormat('%d.%m.%Y %H:%M')


const normalizeEmbed = embed => ({
  ...embed,
  imageUrl: embed.imageUrl || embed.image,
  header: embed.siteName || embed.userName,
  headerImageUrl: embed.siteImageUrl || embed.userProfileImageUrl,
  body: embed.description || embed.html
})

export const Embed = ({ comment }) => {
  if (!comment || !comment.embed) return null

  const { mentioningDocument, embed } = comment

  const {
    url,
    title,
    imageUrl,
    header,
    headerImageUrl,
    body,
    imageAlt,
    __typename
  } = normalizeEmbed(embed)

  return (
    <div {...styles.container}>
      <a href={url} {...styles.link}></a>
      <div {...styles.imageContainer}>
        {imageUrl && (
          <img src={imageUrl} alt={imageAlt || title} {...styles.image} />
        )}
        {mentioningDocument && (
          <div {...styles.topStory}>
            <a
              href={`${mentioningDocument.document.meta.path}#${mentioningDocument.fragmentId}`}
            >
              <img src={mentioningDocument.iconUrl} width={125} height={125} />
            </a>
          </div>
        )}
      </div>
      <div {...styles.text}>
        {header && (
          <Interaction.P {...styles.paragraph}>
            {headerImageUrl && (
              <img src={headerImageUrl} {...styles.siteImage} />
            )}
            <strong>{header}</strong> {embed.userScreenName &&` @${embed.userScreenName}`}
          </Interaction.P>
        )}
        {title && <Interaction.P {...styles.title}>{title}</Interaction.P>}
        {body && (
          <Interaction.P
            {...styles.paragraph}
            dangerouslySetInnerHTML={{ __html: body }}
          ></Interaction.P>
        )}
        {embed.userScreenName && (
          <Interaction.P {...styles.paragraph}>
            <TwitterIcon size={19} fill={colors.disabled} /> {dateFormat(new Date(embed.createdAt))}
          </Interaction.P>
        )}
      </div>
    </div>
  )
}
