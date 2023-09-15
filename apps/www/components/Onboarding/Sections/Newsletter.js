import { gql } from '@apollo/client'
import { css } from 'glamor'

import Section from '../Section'
import NewsletterSubscriptions from '../../Account/NewsletterSubscriptions'
import withT from '../../../lib/withT'

import { Interaction, A } from '@project-r/styleguide'
import Link from 'next/link'

const { P } = Interaction

const styles = {
  p: css({
    marginBottom: 20,
  }),
}

const NEWSLETTERS = [
  'NEWSLETTER_DAILY',
  'NEWSLETTER_WEEKLY',
  'NEWSLETTER_PROJECTR',
]

export const fragments = {
  user: gql`
    fragment NewsletterUser on User {
      id
      ${NEWSLETTERS.map((n) => `${n}: hasConsentedTo(name:"${n}")`).join('\n')}
    }
  `,
}

const Newsletter = (props) => {
  const { user, t } = props

  // Is ticked when at least one newsletter consent it to be found
  const isTicked = NEWSLETTERS.some(
    (n) => user && user[n] !== null && user[n] !== undefined,
  )

  return (
    <Section
      heading={t('Onboarding/Sections/Newsletter/heading')}
      isTicked={isTicked}
      {...props}
    >
      <P {...styles.p}>{t('Onboarding/Sections/Newsletter/preamble')}</P>
      <NewsletterSubscriptions />
      <P {...styles.p}>
        {t.elements('Onboarding/Sections/Newsletter/hint', {
          link: (
            <Link key='account' href='/konto' passHref legacyBehavior>
              <A>{t('Onboarding/Sections/Newsletter/hint/link')}</A>
            </Link>
          ),
        })}
      </P>
    </Section>
  );
}

export default withT(Newsletter)
