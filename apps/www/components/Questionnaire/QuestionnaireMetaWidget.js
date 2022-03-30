import { Component, Fragment } from 'react';
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import Loader from '../Loader'

import { STATUS_POLL_INTERVAL_MS } from '../../lib/constants'

import {
  fontStyles,
  fontFamilies,
  colors,
  Button,
  mediaQueries,
  Editorial,
  TeaserFrontTileRow,
  TeaserFrontTile,
  TeaserFrontTileHeadline,
  TeaserFrontLead,
} from '@project-r/styleguide'
import { countFormat } from '../../lib/utils/format'
import withT from '../../lib/withT'

import Results from './Results'
import { useRouter } from 'next/router'

const styles = {
  number: css({
    fontFamily: fontFamilies.sansSerifMedium,
    whiteSpace: 'nowrap',
    lineHeight: '96px',
    fontSize: 80,
    [mediaQueries.lUp]: {
      lineHeight: '140px',
      fontSize: 116,
    },
  }),
  lead: css({
    ...fontStyles.sansSerifRegular23,
  }),
  big: css({
    fontFamily: fontFamilies.sansSerifMedium,
    lineHeight: '44px',
    fontSize: 38,
    padding: '0 5%',
    marginBottom: 28,
    [mediaQueries.lUp]: {
      marginBottom: 35,
      lineHeight: '72px',
      fontSize: 64,
    },
  }),
}

const ThankYouTile = ({ t }) => (
  <TeaserFrontTile color='#000' bgColor='#fff'>
    <Editorial.Format>{t('questionnaire/title')}</Editorial.Format>
    <TeaserFrontTileHeadline.Interaction>
      <div {...styles.big}>{t('pages/meta/questionnaire/thankyou')}</div>
    </TeaserFrontTileHeadline.Interaction>
  </TeaserFrontTile>
)

const SignupTile = ({ t }) => {
  const router = useRouter()
  return (
    <TeaserFrontTile color={colors.primary} bgColor='#fff'>
      <Editorial.Format>{t('questionnaire/title')}</Editorial.Format>
      <TeaserFrontTileHeadline.Interaction>
        <div {...styles.big}>{t('pages/meta/questionnaire/actionTitle')}</div>
      </TeaserFrontTileHeadline.Interaction>
      <TeaserFrontLead>
        <Button
          primary
          onClick={() =>
            router.push('/umfrage/2018').then(() => window.scrollTo(0, 0))
          }
        >
          {t('pages/meta/questionnaire/actionLabel')}
        </Button>
      </TeaserFrontLead>
    </TeaserFrontTile>
  )
}

const ResultWrapper = ({ children }) => (
  <TeaserFrontTile align='top' color={colors.text} bgColor='#fff'>
    {children}
  </TeaserFrontTile>
)

class QuestionnaireMetaWidget extends Component {
  render() {
    const { data, t } = this.props
    return (
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          const {
            questionnaire: {
              endDate,
              userHasSubmitted,
              turnout: { submitted },
            },
          } = data

          const hasEnded = new Date() > new Date(endDate)

          return (
            <Fragment>
              {!hasEnded && (
                <TeaserFrontTileRow columns={2}>
                  {userHasSubmitted ? (
                    <ThankYouTile t={t} />
                  ) : (
                    <SignupTile t={t} />
                  )}
                  <TeaserFrontTile color={colors.text} bgColor='#fff'>
                    <TeaserFrontTileHeadline.Interaction>
                      <div {...styles.number}>{countFormat(submitted)}</div>
                    </TeaserFrontTileHeadline.Interaction>
                    <TeaserFrontLead>
                      <div {...styles.lead}>
                        {t('pages/meta/questionnaire/counterText')}
                      </div>
                    </TeaserFrontLead>
                  </TeaserFrontTile>
                </TeaserFrontTileRow>
              )}
              <TeaserFrontTileRow columns={2}>
                <Results
                  slug='2018'
                  Wrapper={ResultWrapper}
                  orderFilter={[1, 11]}
                />
              </TeaserFrontTileRow>
            </Fragment>
          )
        }}
      />
    )
  }
}

const query = gql`
  {
    questionnaire(slug: "2018") {
      id
      userHasSubmitted
      endDate
      turnout {
        submitted
      }
    }
  }
`

export default compose(
  withT,
  graphql(query, {
    options: {
      pollInterval: STATUS_POLL_INTERVAL_MS,
    },
  }),
)(QuestionnaireMetaWidget)
