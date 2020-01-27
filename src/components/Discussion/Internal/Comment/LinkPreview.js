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
  })
}

export const LinkPreview = ({ comment }) => {
  if (!comment || !comment.linkPreview) return null

  const {
    linkPreview: { url, title, description, imageUrl, siteName, siteImageUrl }
  } = comment

  return (
    <a href={url} target='_blank' {...styles.link}>
      <div {...styles.container}>
        {imageUrl && <img src={imageUrl} alt={title} {...styles.image} />}
        <div {...styles.text}>
          {siteName && (
            <Interaction.P {...styles.paragraph}>
              {siteImageUrl && <img src={siteImageUrl} {...styles.siteImage} />}
              {siteName}
            </Interaction.P>
          )}
          <Interaction.H3 {...styles.title}>{title}</Interaction.H3>
          {description && (
            <Interaction.P {...styles.paragraph}>{description}</Interaction.P>
          )}
        </div>
      </div>
    </a>
  )
}
