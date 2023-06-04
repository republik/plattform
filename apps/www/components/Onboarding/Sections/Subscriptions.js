import { gql } from '@apollo/client'
import { css } from 'glamor'

import Section from '../Section'
import withT from '../../../lib/withT'

import { Interaction, A } from '@project-r/styleguide'
import { subInfo } from '../../Notifications/enhancers'
import SubscribeCheckbox from '../../Notifications/SubscribeCheckbox'
import Link from 'next/link'

const { P } = Interaction

const styles = {
  p: css({
    marginBottom: 20,
  }),
}

export const fragments = {
  formats: gql`
    fragment FormatInfo on Document {
      id
      meta {
        title
      }
      subscribedByMe {
        ...subInfo
      }
    }
    ${subInfo}
  `,
}

const Subscriptions = (props) => {
  const { sections, t } = props

  const formats = sections
    .filter((section) => section.meta.suggestSubscription)
    .reduce((reducer, section) => reducer.concat(section.formats.nodes), [])

  const isTicked = formats.some(
    (format) => format.subscribedByMe && format.subscribedByMe.active,
  )

  return (
    <Section
      heading={t('Onboarding/Sections/Subscriptions/heading')}
      isTicked={isTicked}
      {...props}
    >
      <P {...styles.p}>{t('Onboarding/Sections/Subscriptions/preamble')}</P>
      <div style={{ margin: '20px 0' }}>
        {formats.map((format, i) => (
          <SubscribeCheckbox
            key={i}
            subscription={format.subscribedByMe}
            filterName='Document'
          />
        ))}
      </div>
      <P {...styles.p}>
        {t.elements('Onboarding/Sections/Subscriptions/hint', {
          link: (
            <Link key='link' href='/benachrichtigungen' passHref>
              <A>{t('Onboarding/Sections/Subscriptions/hint/link')}</A>
            </Link>
          ),
        })}
      </P>
    </Section>
  )
}

export default withT(Subscriptions)
