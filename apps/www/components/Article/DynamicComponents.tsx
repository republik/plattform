import { Loader } from '@project-r/styleguide'

import dynamic from 'next/dynamic'

const LoadingComponent = () => {
  return <Loader loading={true} />
}

// Identifier-based dynamic components mapping

const Manifest = dynamic(() => import('../About/Manifest'), {
  ssr: true,
})
const TeamTeaser = dynamic(() => import('../About/TeamTeaser'), {
  loading: LoadingComponent,
  ssr: false,
})
const TestimonialList = dynamic(() => import('../Testimonial/List'), {
  loading: LoadingComponent,
  ssr: false,
})
const ReasonsVideo = dynamic(() => import('../About/ReasonsVideo'), {
  ssr: true,
})
const NewsletterSignUpDynamic = dynamic(
  () => import('../Auth/NewsletterSignUp'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)
const Votebox = dynamic(() => import('../Vote/Voting'), {
  loading: LoadingComponent,
  ssr: false,
})
const VoteCounter = dynamic(() => import('../Vote/VoteCounter'), {
  loading: LoadingComponent,
  ssr: false,
})
const VoteResult = dynamic(() => import('../Vote/VoteResult'), {
  loading: LoadingComponent,
  ssr: false,
})
const ElectionCandidacy = dynamic(() => import('../Vote/ElectionCandidacy'), {
  loading: LoadingComponent,
  ssr: false,
})
const Election = dynamic(() => import('../Vote/Election'), {
  loading: LoadingComponent,
  ssr: false,
})
const ElectionResult = dynamic(() => import('../Vote/ElectionResult'), {
  loading: LoadingComponent,
  ssr: false,
})
const ElectionResultDiversity = dynamic(
  () => import('../Vote/ElectionDiversity'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)
const ClimateLabCounter = dynamic(() => import('../Climatelab/Counter'), {
  loading: LoadingComponent,
  ssr: false,
})
const Questionnaire = dynamic(
  () =>
    import('../Questionnaire/Questionnaire').then(
      (m) => m.QuestionnaireWithData,
    ),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)

const InstantSurvey = dynamic(() => import('../Questionnaire/InstantSurvey'), {
  loading: LoadingComponent,
  ssr: false,
})

const ClimateLabInlineTeaser = dynamic(
  () => import('../Climatelab/InlineTeaser/ClimateLabInlineTeaser'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)

const ChallengeAcceptedInlineTeaser = dynamic(
  () => import('../ChallengeAccepted/ChallengeAcceptedInlineTeaser'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)

const QuestionnaireSubmissions = dynamic(
  () => import('../Questionnaire/Submissions/legacy'),
  {
    loading: LoadingComponent,
  },
)

const EdgeQuestion = dynamic(() => import('../Climatelab/EdgeQuestion/index'), {
  loading: LoadingComponent,
})

const QuestionnaireOverview = dynamic(
  () => import('../Questionnaire/Submissions'),
  {
    loading: LoadingComponent,
  },
)

const Postcard = dynamic(
  () => import('../Climatelab/Postcard/PostcardDynamicComponent'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)

const PostcardGallery = dynamic(
  () => import('../Climatelab/Postcard/Gallery/PostcardGallery'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)

const CompactDetailsForm = dynamic(
  () => import('../Account/UserInfo/CompactDetailsForm'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)

const TrialForm = dynamic(
  () =>
    import('@app/components/auth/trial/register-for-trial').then(
      (m) => m.RegisterForTrialMinimal,
    ),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)

export const dynamicComponentIdentifiers = {
  MANIFEST: Manifest,
  TEAM_TEASER: TeamTeaser,
  REASONS_VIDEO: ReasonsVideo,
  VOTEBOX: Votebox,
  VOTE_COUNTER: VoteCounter,
  VOTE_RESULT: VoteResult,
  TESTIMONIAL_LIST: TestimonialList,
  ELECTION_CANDIDACY: ElectionCandidacy,
  ELECTION: Election,
  ELECTION_RESULT: ElectionResult,
  ELECTION_RESULT_DIVERSITY: ElectionResultDiversity,
  INSTANT_SURVEY: InstantSurvey,
  QUESTIONNAIRE: Questionnaire,
  QUESTIONNAIRE_SUBMISSIONS: QuestionnaireSubmissions,
  QUESTIONNAIRE_OVERVIEW: QuestionnaireOverview,
  EDGE_QUESTION: EdgeQuestion,
  NEWSLETTER_SIGNUP: NewsletterSignUpDynamic,
  CLIMATE_LAB_COUNTER: ClimateLabCounter,
  CLIMATE_LAB_INLINE_TEASER: ClimateLabInlineTeaser,
  POSTCARD: Postcard,
  POSTCARD_GALLERY: PostcardGallery,
  CHALLENGE_ACCEPTED_INLINE_TEASER: ChallengeAcceptedInlineTeaser,
  COMPACT_DETAILS_FORM: CompactDetailsForm,
  TRIAL_FORM: TrialForm,
}
