import React from 'react'
import { css, merge } from 'glamor'
import { timeFormat } from '../../lib/timeFormat'
import colors from '../../theme/colors'
import { convertStyleToRem } from '../Typography/utils'
import {
  serifTitle20,
  serifTitle16,
  sansSerifRegular14,
  sansSerifMedium14,
  sansSerifMedium15,
  sansSerifRegular13,
  sansSerifMedium20,
  sansSerifMedium16,
  sansSerifRegular12
} from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'
import { Icon } from '../Discussion/Internal/Comment'

const dateFormat = timeFormat('%d.%m.%Y')
const hoursFormat = timeFormat('%H:%M')

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    margin: '1rem 0'
  }),
  icon: css({
    display: 'none',
    [mUp]: {
      display: 'block',
      textAlign: 'center',
      padding: 10,
      flex: '0 0 80px'
    }
  }),
  notification: css({
    position: 'relative',
    flexGrow: 1,
    borderBottom: `1px solid ${colors.divider}`,
    marginLeft: 10,
    paddingBottom: '0.5rem',
    [mUp]: {
      marginLeft: 20
    }
  }),
  title: css({
    margin: '0.2rem 0 0'
  }),
  titleEditorial: css({
    ...convertStyleToRem(serifTitle16),
    [mUp]: {
      ...convertStyleToRem(serifTitle20)
    }
  }),
  titleCommunity: css({
    ...convertStyleToRem(sansSerifMedium16),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium20)
    }
  }),
  description: css({
    marginTop: '0.1rem',
    ...convertStyleToRem(sansSerifRegular13),
    [mUp]: {
      maxWidth: '67%',
      ...convertStyleToRem(sansSerifRegular14)
    },
    color: colors.text
  }),
  source: css({
    textDecoration: 'none',
    ...convertStyleToRem(sansSerifMedium14),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium15)
    }
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  }),
  date: css({
    color: colors.disabled,
    background: colors.containerBg,
    position: 'absolute',
    paddingLeft: 5,
    ...convertStyleToRem(sansSerifRegular12),
    right: 0,
    bottom: '-0.42rem',
    [mUp]: {
      bottom: '-0.46rem',
      ...convertStyleToRem(sansSerifRegular14)
    }
  })
}

const isToday = data => {
  const today = new Date()
  return (
    data.getDate() === today.getDate() &&
    data.getMonth() === today.getMonth() &&
    data.getFullYear() === today.getFullYear()
  )
}

const DefaultLink = ({ children, path }) => children

export const TeaserNotification = ({
  href,
  createdDate,
  source,
  type,
  title,
  notification,
  disabled,
  Link = DefaultLink
}) => {
  const date = new Date(createdDate)

  return (
    <Link href={href} passHref>
      <a {...styles.link} href={href}>
        <div {...styles.container}>
          <div {...styles.icon}>
            {type === 'Editorial' && (
              <img src={source.icon} alt={source.name} width='100%' />
            )}
            {type === 'Community' && <Icon size={24} fill={colors.primary} />}
          </div>
          <div {...styles.notification}>
            {source.name && (
              <Link href={href} passHref>
                <a
                  {...styles.source}
                  href={source.href}
                  style={{ color: source.color }}
                >
                  {source.name}&nbsp;
                </a>
              </Link>
            )}
            <h1 {...merge(styles.title, styles[`title${type}`])}>{title}</h1>
            <p
              {...styles.description}
              dangerouslySetInnerHTML={{ __html: notification }}
            />
            <span {...styles.date}>
              {isToday(date) ? hoursFormat(date) : dateFormat(date)}
            </span>
          </div>
        </div>
      </a>
    </Link>
  )
}
