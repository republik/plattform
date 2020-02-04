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
import Badge from './Badge'
import { linkStyle } from '../../../Typography'

import { fontStyles } from '../../../../theme/fonts'

const styles = {
  link: css({
    textDecoration: 'none'
  }),
  container: css({
    border: `1px solid ${colors.divider}`,
    marginTop: 15,
    [mUp]: {
      marginTop: 0
    }
  }),
  imageContainer: css({
    position: 'relative'
  }),
  image: css({
    borderBottom: `1px solid ${colors.divider}`,
    width: '100%'
  }),
  text: css({
    marginTop: 3,
    padding: '0.1rem 10px 10px 10px'
  }),
  siteImage: css({
    width: 19,
    height: 19,
    marginRight: 5,
    marginBottom: 3,
    verticalAlign: 'middle'
  }),
  paragraph: css({
    marginTop: '0.1rem',
    ...sansSerifRegular13,
    [mUp]: {
      ...sansSerifRegular15
    },
    '& a': linkStyle
  }),
  title: css({
    margin: '0.3rem 0 0.5rem 0',
    ...sansSerifMedium16,
    [mUp]: {
      ...sansSerifMedium18,
      lineHeight: '1.3rem'
    },
    lineHeight: '1.3rem'
  }),
  topStory: css({
    position: 'absolute',
    top: -30,
    right: -15,
    color: 'red',
    textTransform: 'uppercase'
  })
}

const normalizeEmbed = embed => ({
  ...embed,
  imageUrl: embed.imageUrl || embed.image,
  header: embed.siteName || `${embed.userName} @${embed.userScreenName}`,
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
    <a href={url} target='_blank' {...styles.link}>
      <div {...styles.container}>
        <div {...styles.imageContainer}>
          {imageUrl && (
            <img src={imageUrl} alt={imageAlt || title} {...styles.image} />
          )}
          {mentioningDocument && (
            <div {...styles.topStory}>
              <Badge
                url={`${mentioningDocument.document.meta.path}#${mentioningDocument.fragmentId}`}
                badgeUrl={mentioningDocument.iconUrl}
              />
            </div>
          )}
        </div>
        <div {...styles.text}>
          {header && (
            <Interaction.P {...styles.paragraph}>
              {headerImageUrl && (
                <img src={headerImageUrl} {...styles.siteImage} />
              )}
              {header}
            </Interaction.P>
          )}
          {title && <Interaction.P {...styles.title}>{title}</Interaction.P>}
          {body && (
            <Interaction.P
              {...styles.paragraph}
              dangerouslySetInnerHTML={{ __html: body }}
            ></Interaction.P>
          )}
        </div>
      </div>
    </a>
  )
}
