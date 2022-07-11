import compose from 'lodash/flowRight'
import { enforceMembership } from '../../components/Auth/withMembership'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import { t } from '../../lib/withT'

import { A } from '@project-r/styleguide'
import { withRouter } from 'next/router'
import { withQuestionnaire } from '../../components/Questionnaire/enhancers'
import Questionnaire from '../../components/Questionnaire/Questionnaire'
import Frame from '../../components/Frame'
import Link from 'next/link'
import { withDefaultSSR } from '../../lib/apollo/helpers'

const meta = {
  title: t('questionnaire/title'),
  description: t('questionnaire/description'),
  facebookTitle: t('pages/meta/questionnaire/socialTitle'),
  facebookDescription: t('pages/meta/questionnaire/socialDescription'),
  twitterTitle: t('pages/meta/questionnaire/socialTitle'),
  twitterDescription: t('pages/meta/questionnaire/socialDescription'),
  facebookImage: `${CDN_FRONTEND_BASE_URL}/static/social-media/umfrage/2018/facebookImage.png`,
  twitterImage: `${CDN_FRONTEND_BASE_URL}/static/social-media/umfrage/2018/twitterImage.png`,
}

export const description = t.elements('pages/meta/questionnaire/unauthorized', {
  buyLink: (
    <Link href='/angebote' key='pledge' passHref>
      <A>{t('pages/meta/questionnaire/unauthorized/buyText')}</A>
    </Link>
  ),
})

const QuestionnairePage = (props) => {
  return (
    <Frame meta={meta}>
      <Questionnaire {...props} />
    </Frame>
  )
}

export default withDefaultSSR(
  compose(
    withRouter,
    (WrappedComponent) => (props) =>
      <WrappedComponent {...props} slug={props.router.query.slug} />,
    withQuestionnaire,
    enforceMembership(meta, { title: t('questionnaire/title'), description }),
  )(QuestionnairePage),
)
