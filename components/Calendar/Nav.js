import React from 'react'
import { css } from 'glamor'
import BackIcon from 'react-icons/lib/md/chevron-left'
import ForthIcon from 'react-icons/lib/md/chevron-right'
import {
  IconButton,
  fontFamilies,
  plainButtonRule
} from '@project-r/styleguide'
import { datePickerFormat, reformatUrlDate } from './utils'
import withT from '../../lib/withT'

const styles = {
  navigation: css({
    padding: '15px 0'
  }),
  currentDates: css({
    margin: '0 20px',
    fontFamily: fontFamilies.sansSerifMedium
  }),
  navButton: {
    display: 'inline-block',
    margin: 0
  }
}

export const Nav = ({ children }) => (
  <div {...styles.navigation}>{children}</div>
)

export const NavButton = ({ goBack, goForth }) => (
  <IconButton
    Icon={goBack ? BackIcon : ForthIcon}
    onClick={goBack || goForth}
    style={styles.navButton}
    size={36}
  />
)

export const ResetLink = withT(({ t, reset }) => (
  <button {...plainButtonRule} onClick={reset} style={{ marginLeft: 20 }}>
    {t('repo/calendar/nav/reset')}
  </button>
))

export const CurrentDates = ({ from, until }) => {
  const displayDate = date => reformatUrlDate(date, datePickerFormat)
  return (
    <span {...styles.currentDates}>
      {displayDate(from)} - {displayDate(until)}
    </span>
  )
}
