import React from 'react'
import * as Interaction from '../../../../components/Typography/Interaction'
import { css } from 'glamor'
import colors from '../../../../theme/colors'
import {
  sansSerifRegular13,
  sansSerifRegular15
} from '../../../Typography/styles'
import { mediaQueries } from '../../../../lib'

const styles = {
  container: css({
    border: `1px solid ${colors.divider}`
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
    [mediaQueries.mUp]: {
      width: 15,
      height: 15,
      marginTop: 5,
      marginRight: 5
    }
  }),
  paragraph: css({
    ...sansSerifRegular13,
    [mediaQueries.mUp]: {
      ...sansSerifRegular15
    }
  }),
  title: css({
    marginBottom: '0.3rem',
    marginTop: '0.1rem'
  })
}

export const LinkPreview = ({ comment }) => {
  if (!comment || !comment.linkPreview) return null

  const {
    linkPreview: { url, title, description, imageUrl, siteName, siteImageUrl }
  } = comment

  // <a href={url} target='_blank'>
  return (
    <div {...styles.container}>
      <img src={imageUrl} alt={title} {...styles.image} />
      <div {...styles.text}>
        <Interaction.P {...styles.paragraph}>
          <img src={siteImageUrl} {...styles.siteImage} />
          {siteName}
        </Interaction.P>
        <Interaction.H3 {...styles.title}>{title}</Interaction.H3>
        <Interaction.P {...styles.paragraph}>{description}</Interaction.P>
      </div>
    </div>
  )
}
