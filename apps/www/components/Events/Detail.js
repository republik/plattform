import { css } from 'glamor'

import { parseDate, swissTime } from '../../lib/utils/format'
import { intersperse } from '../../lib/utils/helpers'
import withT from '../../lib/withT'

import {
  Interaction,
  A,
  RawHtml,
  fontFamilies,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'

import ActionBar from '../ActionBar'

import { PUBLIC_BASE_URL } from '../../lib/constants'

export const EVENT_PADDING = 60

const BLOCK_PADDING_TOP = 10

const styles = {
  container: css({
    marginBottom: 60,
  }),
  block: css({
    padding: `${BLOCK_PADDING_TOP}px 0`,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    position: 'relative',
    wordWrap: 'break-word',
    [mediaQueries.mUp]: {
      paddingLeft: EVENT_PADDING,
    },
  }),
  hr: css({
    height: 0,
    border: 0,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
  }),
  title: css({
    marginBottom: 15,
  }),
  label: css({
    fontSize: 17,
    fontFamily: fontFamilies.sansSerifMedium,
    [mediaQueries.mUp]: {
      lineHeight: '25px',
      position: 'absolute',
      left: 0,
      top: BLOCK_PADDING_TOP + 3,
    },
  }),
}

const Label = ({ children }) => <div {...styles.label}>{children}</div>

const { H1, P } = Interaction

const weekday = swissTime.format('%A')

const Event = withT(
  ({
    t,
    data: {
      title,
      description,
      link,
      date: rawDate,
      time,
      where,
      locationLink,
      slug,
    },
  }) => {
    const [colorScheme] = useColorContext()
    const date = parseDate(rawDate)
    let location =
      !!where && intersperse(where.split('\n'), (d, i) => <br key={i} />)
    if (locationLink && location) {
      location = (
        <A href={locationLink} target='_blank' rel='noopener'>
          {location}
        </A>
      )
    }
    const shareObject = {
      title: title,
      url: `${PUBLIC_BASE_URL}/veranstaltung/${slug}`,
      emailSubject: title,
      tweet: title,
      shareOverlayTitle: t('events/share/title'),
      label: t('events/share/title'),
    }
    const borderRule = colorScheme.set('borderTopColor', 'divider')

    return (
      <div {...styles.container}>
        <div {...styles.block} {...borderRule}>
          <Label>{t('events/labels/description')}</Label>
          <H1 {...styles.title}>{title}</H1>
          <RawHtml
            type={P}
            key={slug}
            dangerouslySetInnerHTML={{
              __html: description.split('\n').join('<br />'),
            }}
          />
          {!!link && (
            <P>
              <A href={link} target='_blank' rel='noopener'>
                {link}
              </A>
            </P>
          )}
        </div>

        <div {...styles.block} {...borderRule}>
          <Label>{t('events/labels/date')}</Label>
          <P>{[weekday(date), rawDate, time].join(', ')}</P>
        </div>

        <div {...styles.block} {...borderRule}>
          {!!where && <Label>{t('events/labels/location')}</Label>}
          {!!where && <P>{location}</P>}
          {!!where && <hr {...styles.hr} {...borderRule} />}
          <ActionBar share={shareObject} />
        </div>
      </div>
    )
  },
)

export default Event
