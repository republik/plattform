import React from 'react'
import * as Interaction from '../../../../components/Typography/Interaction'
import { css } from 'glamor'
import colors from '../../../../theme/colors'
import {
  sansSerifRegular13,
  sansSerifRegular15
} from '../../../Typography/styles'
import { mUp } from '../../../../theme/mediaQueries'

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
  image: css({
    borderBottom: `1px solid ${colors.divider}`,
    width: '100%'
  }),
  text: css({
    padding: '0.1rem 10px 10px 10px'
  }),
  siteImage: css({
    borderRadius: '100%',
    float: 'left',
    width: 12,
    height: 12,
    marginTop: 3,
    marginRight: 3,
    [mUp]: {
      width: 15,
      height: 15,
      marginTop: 5,
      marginRight: 5
    }
  }),
  paragraph: css({
    marginTop: '0.2rem',
    ...sansSerifRegular13,
    [mUp]: {
      ...sansSerifRegular15
    }
  }),
  title: css({
    margin: '0.5rem 0',
    lineHeight: '1.35rem'
  }),
  topStory: css({
    color: 'red',
    textTransform: 'uppercase'
  })
}

const normalizeEmbed = embed => ({
  ...embed,
  imageUrl: embed.imageUrl || embed.image,
  header: embed.siteName || embed.userName,
  headerImageUrl: embed.siteImageUrl || embed.userProfileImageUrl,
  body: embed.description || embed.text
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
        {imageUrl && (
          <img src={imageUrl} alt={imageAlt || title} {...styles.image} />
        )}
        <div {...styles.text}>
          {mentioningDocument && (
            <span {...styles.topStory}>!!TOP STORY!!</span>
          )}
          {header && (
            <Interaction.P {...styles.paragraph}>
              {headerImageUrl && (
                <img src={headerImageUrl} {...styles.siteImage} />
              )}
              {header}
            </Interaction.P>
          )}
          {title && <Interaction.H3 {...styles.title}>{title}</Interaction.H3>}
          {body && (
            <div>
              {body.split('\n').map(part => (
                <Interaction.P {...styles.paragraph}>{part}</Interaction.P>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  )
}
