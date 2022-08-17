import { css } from 'glamor'
import {
  MdChevronLeft as BackIcon,
  MdChevronRight as ForthIcon,
} from 'react-icons/md'
import {
  IconButton,
  fontFamilies,
  plainButtonRule,
} from '@project-r/styleguide'
import { datePickerFormat, reformatUrlDate } from '../../lib/utils/calendar'
import withT from '../../lib/withT'

const styles = {
  navigation: css({
    padding: '15px 0',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }),
  currentDates: css({
    margin: '0 20px',
    fontFamily: fontFamilies.sansSerifMedium,
  }),
  navButton: {
    display: 'inline-block',
    margin: 0,
  },
  resetButton: css({
    marginLeft: 20,
    ':hover': {
      textDecoration: 'underline',
    },
  }),
}

export const Nav = ({ children }) => (
  <div {...styles.navigation}>{children}</div>
)

export const NavButton = ({ goBack, goForth }) => (
  <IconButton
    Icon={goBack ? BackIcon : ForthIcon}
    onClick={goBack || goForth}
    style={styles.navButton}
    size={24}
  />
)

export const ResetLink = withT(({ t, reset }) => (
  <button {...plainButtonRule} {...styles.resetButton} onClick={reset}>
    {t('repo/calendar/nav/reset')}
  </button>
))

export const CurrentDates = ({ from, until }) => {
  const displayDate = (date) => reformatUrlDate(date, datePickerFormat)
  return (
    <span {...styles.currentDates}>
      {displayDate(from)} - {displayDate(until)}
    </span>
  )
}
