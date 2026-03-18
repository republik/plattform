import { css, cx } from '@republik/theme/css'
import { formatDuration, intervalToDuration } from 'date-fns'
import { de } from 'date-fns/locale'
import { ComponentPropsWithoutRef } from 'react'
import { swissTime } from '@/lib/utils/formats'

export const displayStyles = {
  hFlexBox: css({
    display: 'flex',
    flexDirection: 'row',
    '& > *:not(:last-child)': {
      marginRight: '10',
    },
  }),
}

const dateFormat = swissTime.format('%d.%m.%Y')
export const displayDate = (rawDate: string) => {
  return dateFormat(new Date(rawDate))
}

const dateTimeFormat = swissTime.format('%d.%m.%Y, %H:%M Uhr')
export const displayDateTime = (rawDate: string) => {
  return dateTimeFormat(new Date(rawDate))
}

export const dateDiff = (startDate: string, endDate: string) => {
  if (startDate && endDate) {
    const interval = intervalToDuration({
      start: new Date(startDate),
      end: new Date(endDate),
    })
    return formatDuration(interval, {
      format: ['years', 'months', 'days'],
      locale: de,
    })
  }
}

export const Section = (props: ComponentPropsWithoutRef<'div'>) => (
  <div
    {...props}
    className={css({
      padding: '2',
      margin: '2',
      backgroundColor: 'background',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    })}
  />
)

export const InteractiveSection = (props: ComponentPropsWithoutRef<'div'>) => (
  <div
    {...props}
    tabIndex={0}
    className={cx(
      css({
        padding: '2',
        margin: '2',
        backgroundColor: 'background',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }),
      css({
        '& .show-on-focus': {
          opacity: 0,
        },
        '&:focus, &:hover': {
          outline: 'none',
          backgroundColor: 'hover',
          '& .show-on-focus': {
            opacity: 1,
          },
        },
      }),
    )}
  />
)

export const SectionTitle = (props: ComponentPropsWithoutRef<'h4'>) => (
  <h4
    {...props}
    className={css({
      textStyle: 'h2Sans',
      mb: '4',
    })}
  />
)

export const SectionSubhead = (props: ComponentPropsWithoutRef<'h5'>) => (
  <h5
    {...props}
    className={css({
      textStyle: 'h2Sans',
      fontSize: 'l',
      my: '2',
    })}
  />
)

export const SectionNav = (props: ComponentPropsWithoutRef<'nav'>) => (
  <nav {...props} className={css({ mb: '4' })} />
)

export const SectionMenu = (props: ComponentPropsWithoutRef<'div'>) => (
  <div
    {...props}
    className={css({
      position: 'absolute',
      top: '2',
      right: '2',
    })}
  />
)

export const TextButton = (props: ComponentPropsWithoutRef<'button'>) => (
  <button
    {...props}
    className={cx(
      css({
        cursor: 'pointer',
        display: 'inline-block',
        outline: 'none',
        background: 'transparent',
        border: 'none',
        padding: '0',
        color: 'primary',
        '&:not([disabled]):focus, &:hover': {
          color: 'primaryHover',
        },
        _disabled: {
          color: 'disabled',
        },
      }),
      props.className,
    )}
  />
)

export const DL = (props: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={css({ my: '2' })} />
)

export const DT = (props: ComponentPropsWithoutRef<'div'>) => (
  <div
    {...props}
    className={css({
      textStyle: 'body',

      '&:not(:first-child)': {
        mt: '4',
      },
    })}
  />
)

export const DD = (props: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={css({ textStyle: 'body', fontSize: 'l' })} />
)
