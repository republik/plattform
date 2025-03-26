import { Fragment } from 'react'
import { useMutation } from '@apollo/client'
import {
  SubmitUserProgressConsentDocument,
  RevokeUserProgressConsentDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { gql } from '@apollo/client'
import { css } from 'glamor'

import { Interaction, mediaQueries, Button, A } from '@project-r/styleguide'

import Section from '../Section'
import ProgressSettings from '../../Account/ProgressSettings'
import { PROGRESS_EXPLAINER_PATH } from '../../../lib/constants'
import withT from '../../../lib/withT'
import Link from 'next/link'

const { P } = Interaction

const styles = {
  p: css({
    marginBottom: 20,
  }),
  actions: css({
    marginBottom: 20,
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    '& > button': {
      flexGrow: 1,
      margin: '5px 15px 0 0',
      minWidth: '120px',
      [mediaQueries.mUp]: {
        flexGrow: 0,
        margin: '5px 15px 0 0',
        minWidth: '160px',
      },
    },
  }),
}

export const fragments = {
  user: gql`
    fragment UsabilityUser on User {
      id
      PROGRESS: hasConsentedTo(name: "PROGRESS")
    }
  `,
}

const Usability = (props) => {
  const { user, onContinue, t } = props
  const [submitProgressConsent, { loading: submitting }] = useMutation(
    SubmitUserProgressConsentDocument,
    { onCompleted: () => onContinue(props) },
  )
  const [revokeProgressConsent, { loading: revoking }] = useMutation(
    RevokeUserProgressConsentDocument,
    { onCompleted: () => onContinue(props) },
  )

  // Is ticked when either REVOKE or GRANT consent was submitted.
  const hasConsented = user && user.PROGRESS !== null

  return (
    <Section
      heading={t('Onboarding/Sections/Usability/heading')}
      isTicked={hasConsented}
      showContinue={hasConsented}
      {...props}
    >
      {hasConsented ? (
        <Fragment>
          <ProgressSettings />
          <br />
        </Fragment>
      ) : (
        <Fragment>
          <P {...styles.p}>
            {t('Onboarding/Sections/Usability/paragraph1', null, '')}
          </P>
          <P {...styles.p}>
            {t('Onboarding/Sections/Usability/paragraph2', null, '')}
          </P>
          <P {...styles.p}>
            {t.elements(
              'Onboarding/Sections/Usability/paragraph3',
              {
                linkMore: PROGRESS_EXPLAINER_PATH && (
                  <Link
                    key='linkMore'
                    href={PROGRESS_EXPLAINER_PATH}
                    passHref
                    legacyBehavior
                  >
                    <A>{t('Onboarding/Sections/Usability/linkMore')}</A>
                  </Link>
                ),
              },
              '',
            )}
          </P>
          <div {...styles.actions}>
            <Button
              onClick={() => submitProgressConsent()}
              disabled={submitting}
            >
              {t('Onboarding/Sections/Usability/button/submitConsent')}
            </Button>
            <Button onClick={() => revokeProgressConsent()} disabled={revoking}>
              {t('Onboarding/Sections/Usability/button/revokeConsent')}
            </Button>
          </div>
        </Fragment>
      )}
    </Section>
  )
}

export default withT(Usability)
