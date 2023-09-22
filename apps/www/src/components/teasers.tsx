import { css } from '@app/styled-system/css'

type Props = {
  repoid: string
}

export const TeaserArticle = ({ repoid }: Props) => {
  return (
    <div
      className={css({
        padding: '4',
        background: 'challengeAccepted.teaserBackground',
        color: 'text.inverted',
      })}
    >
      <p className={css({ textStyle: 'xs' })}>Article</p>
      <h3 className={css({ textStyle: 'xl' })}>{repoid}</h3>
    </div>
  )
}

export const TeaserNewsletter = ({ repoid }: Props) => {
  return (
    <div
      className={css({
        padding: '4',
        background: 'challengeAccepted.teaserBackground',
        color: 'text.inverted',
      })}
    >
      <p className={css({ textStyle: 'xs' })}>NL</p>
      <h3 className={css({ textStyle: 'xl' })}>{repoid}</h3>
    </div>
  )
}

type EventProps = { title: string }

export const TeaserEvent = ({ title }: EventProps) => {
  return (
    <div
      className={css({
        padding: '4',
        background: 'challengeAccepted.teaserBackground',
        color: 'text.inverted',
      })}
    >
      <p className={css({ textStyle: 'xs' })}>Event</p>
      <h3 className={css({ textStyle: 'xl' })}>{title}</h3>
    </div>
  )
}
