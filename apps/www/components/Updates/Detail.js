import { css } from 'glamor'

import { swissTime } from '../../lib/utils/format'
import withT from '../../lib/withT'

import {
  H1,
  P,
  RawHtml,
  colors,
  fontFamilies,
  mediaQueries,
} from '@project-r/styleguide'

import ActionBar from '../ActionBar'

import { PUBLIC_BASE_URL } from '../../lib/constants'

const styles = {
  title: css({
    marginBottom: 15,
    [mediaQueries.onlyS]: {
      fontSize: 36,
      lineHeight: '39px',
    },
  }),
  content: css({
    color: 'var(--color-text)',
    fontFamily: fontFamilies.serifRegular,
    fontSize: 16,
    lineHeight: '25px',
    [mediaQueries.mUp]: {
      fontSize: 21,
      lineHeight: '32px',
    },
  }),
  container: css({
    borderBottom: `1px solid ${'var(--color-divider)'}`,
    paddingBottom: 10,
    marginBottom: 60,
  }),
  hr: css({
    height: 0,
    border: 0,
    borderTop: `1px solid ${'var(--color-divider)'}`,
  }),
  label: css({
    fontFamily: fontFamilies.sansSerifMedium,
    fontSize: 17,
    lineHeight: '25px',
    letterSpacing: -0.19,
  }),
}

const Content = ({ children, ...props }) => (
  <div {...props} {...styles.content}>
    {children}
  </div>
)

const publishedDateTimeFormat = swissTime.format('%e. %B %Y %H Uhr')

const Update = withT(
  ({ data: { slug, title, text, children, publishedDateTime } }) => {
    const date = new Date(publishedDateTime)
    const shareObject = {
      title: title,
      url: `${PUBLIC_BASE_URL}/updates/${slug}`,
      emailSubject: title,
      tweet: title,
    }
    return (
      <div {...styles.container}>
        <H1 {...styles.title}>{title}</H1>
        <div {...styles.label}>{publishedDateTimeFormat(date)}</div>
        {children ? (
          <Content>{children}</Content>
        ) : (
          <RawHtml
            style='serif'
            type={Content}
            dangerouslySetInnerHTML={{
              __html: text || '',
            }}
          />
        )}

        <P>
          <ActionBar share={shareObject} />
        </P>
      </div>
    )
  },
)

export default Update
