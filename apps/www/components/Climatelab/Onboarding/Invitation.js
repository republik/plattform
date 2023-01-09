import { css } from 'glamor'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

import compose from 'lodash/flowRight'

import { Interaction, mediaQueries, Button } from '@project-r/styleguide'

import Section from '../../Onboarding/Section'
import Form from '../../Access/Campaigns/Form'
import Grants from '../../Access/Campaigns/Grants'

import { useTranslation } from '../../../lib/withT'

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
    width: 160,
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

const grantMutation = gql`
  mutation grantAccess($campaignId: ID!, $email: String!, $message: String) {
    grantAccess(campaignId: $campaignId, email: $email, message: $message) {
      email
    }
  }
`

const query = gql`
  query accessCampaigns {
    me {
      id
      accessCampaigns {
        id
        title
        type
        description
        defaultMessage
        grants {
          id
          email
          voucherCode
          beginBefore
          beginAt
          endAt
        }
        slots {
          total
          used
          free
        }
        perks {
          giftableMemberships
        }
      }
    }
  }
`

const Invitation = (props) => {
  const { grantAccess, onContinue } = props
  const { t } = useTranslation()

  const campaign = props.user.accessCampaigns?.filter(
    (campaign) => campaign.id === '672cc127-f3a0-40ee-b000-9aa560aae697', // climate lab invitation campaign
  )[0]

  if (!campaign) {
    return null
  }

  const slotsUsed = campaign.slots.used

  return (
    <Section
      heading={t('Climatelab/Onboarding/Invitation/heading')}
      isTicked={slotsUsed >= 1}
      showContinue={slotsUsed >= 1}
      {...props}
    >
      <>
        <P {...styles.p}>
          {t('Climatelab/Onboarding/Invitation/paragraph1', null, '')}
        </P>
        <Grants campaign={campaign} />

        <Form campaign={campaign} grantAccess={grantAccess} />

        {slotsUsed < 1 && (
          <>
            <div {...styles.actions}>
              <Button block onClick={onContinue}>
                {t('Onboarding/Sections/Profile/button/continue', null, '')}
              </Button>
            </div>
          </>
        )}
      </>
    </Section>
  )
}

export default compose(
  graphql(grantMutation, {
    props: ({ mutate }) => ({
      grantAccess: (variables) =>
        mutate({
          variables,
          refetchQueries: [
            {
              query,
            },
          ],
        }),
    }),
  }),
)(Invitation)
