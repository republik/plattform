import { css, merge } from 'glamor'
import { fontStyles, colors } from '@project-r/styleguide'
import { swissTime } from '../../lib/utils/formats'

export const displayStyles = {
  section: css({
    padding: '10px 10px',
    margin: '10px 10px',
    backgroundColor: '#fff',
    position: 'relative'
  }),
  interactiveSection: css({
    transition: 'background-color 0.2s',
    '& .show-on-focus': {
      transition: 'opacity 0.2s',
      opacity: 0
    },
    '&:focus, &:hover': {
      outline: 'none',
      backgroundColor: colors.secondaryBg,
      '& .show-on-focus': {
        opacity: 1
      }
    }
  }),
  sectionTitle: css({
    ...fontStyles.sansSerifRegular23,
    margin: '0 0 15px 0'
  }),
  sectionSubhead: css({
    ...fontStyles.sansSerifMedium19,
    margin: '6px 0 8px 0'
  }),
  sectionMenu: css({
    position: 'absolute',
    top: '10px',
    right: '20px'
  }),
  sectionNav: css({
    margin: '0 0 15px 0'
  }),
  hFlexBox: css({
    display: 'flex',
    flexDirection: 'row',
    '& > *:not(:last-child)': {
      marginRight: '40px'
    }
  }),
  definitionList: css({
    margin: '9px 0 9px 0'
  }),
  definitionTitle: css({
    ...fontStyles.label,
    lineHeight: '18px',
    '&:not(:first-child)': {
      marginTop: '18px'
    }
  }),
  definition: css({
    ...fontStyles.sansSerifRegular18
  }),
  textButton: css({
    cursor: 'pointer',
    display: 'inline-block',
    outline: 'none',
    background: 'none',
    border: 'none',
    padding: '0',
    transition: 'color 0.1s',
    fontSize: 'inherit',
    color: colors.primary,
    '&:not([disabled]):focus, &:hover': {
      color: colors.secondary
    },
    '&[disabled]': {
      color: colors.disabled
    }
  })
}

const dateFormat = swissTime.format('%d.%m.%Y')
export const displayDate = rawDate => {
  return dateFormat(new Date(rawDate))
}

const dateTimeFormat = swissTime.format(
  '%d.%m.%Y, %H:%M Uhr'
)
export const displayDateTime = rawDate => {
  return dateTimeFormat(new Date(rawDate))
}

export const Section = props => (
  <div {...props} {...displayStyles.section} />
)

export const InteractiveSection = props => (
  <div
    {...props}
    tabIndex="0"
    {...merge(
      displayStyles.section,
      displayStyles.interactiveSection
    )}
  />
)

export const SectionTitle = props => (
  <h4 {...props} {...displayStyles.sectionTitle} />
)

export const SectionSubhead = props => (
  <h5 {...props} {...displayStyles.sectionSubhead} />
)

export const SectionNav = props => (
  <nav {...props} {...displayStyles.sectionNav} />
)

export const SectionMenu = props => (
  <div {...props} {...displayStyles.sectionMenu} />
)

export const TextButton = props => (
  <button {...props} {...displayStyles.textButton} />
)

export const DL = props => (
  <div {...props} {...displayStyles.definitionList} />
)

export const DT = props => (
  <div {...props} {...displayStyles.definitionTitle} />
)

export const DD = props => (
  <div {...props} {...displayStyles.definition} />
)
