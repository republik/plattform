import Link from 'next/link'
import { useRouter } from 'next/router'
import { QUESTIONNAIRE_SUBMISSION_BOOL_QUERY } from '../graphql'
import { useQuery } from '@apollo/client'
import { useMe } from 'lib/context/MeContext'
import { Editorial, Interaction } from '@project-r/styleguide'

// re-introduced since actionbar/article only expect a single share param
// (otherwise share for multiple questions fails)
export const QUESTION_SEPARATOR = ','
export const SUBMISSION_PREFIX = 'submission-'

export const MAIN_VIEWPORT_FOCUS = 'answers'

// We exclude anything that has a query param name "share"
// from the SSG rendering (next.config l.129). This is necessary
// for the shares to work properly. It's also the reason why we
// are doing this weird parsing with the share param and separator and prefix.
// Like: '?share=submission-5463 param, instead of just '?submission=6543'
export const mapShareParam = (
  share,
): { questionIds?: string[]; submissionId?: string } => {
  if (typeof share === 'string' && share.startsWith(SUBMISSION_PREFIX)) {
    return { submissionId: share.replace(SUBMISSION_PREFIX, '') }
  } else if (typeof share === 'string') {
    return { questionIds: share.split(QUESTION_SEPARATOR) }
  }
  return {}
}

const getPathname = (router) => router.asPath.split('?')[0].split('#')[0]

const QuestionnaireLink = ({ share, children }) => {
  const router = useRouter()
  const pathname = getPathname(router)

  return (
    <Link
      href={{
        pathname,
        query: {
          share,
        },
      }}
      passHref
      legacyBehavior
    >
      {children}
    </Link>
  )
}

export const QuestionLink = ({ questions, children }) => {
  const share = questions.map((q) => q.id).join(QUESTION_SEPARATOR)
  return <QuestionnaireLink share={share}>{children}</QuestionnaireLink>
}

export const SubmissionLink = ({ submissionId, children }) => {
  const share = `${SUBMISSION_PREFIX}${submissionId}`
  return <QuestionnaireLink share={share}>{children}</QuestionnaireLink>
}

type FormLinkProps = {
  slug: string
  formPath: string
  submissionId?: string
}

export const FormLink = ({ slug, formPath, submissionId }: FormLinkProps) => {
  const { me } = useMe()
  const { data } = useQuery(QUESTIONNAIRE_SUBMISSION_BOOL_QUERY, {
    skip: !me,
    variables: { slug, userIds: [me?.id] },
  })

  const hasFilledQuestionnaire = data?.questionnaire?.results?.totalCount > 0

  if (!hasFilledQuestionnaire)
    return (
      <Editorial.P>
        Wie lauten Ihre Antworten? Füllen Sie unseren Fragebogen{' '}
        <Link href={formPath} legacyBehavior>
          <Editorial.A>hier</Editorial.A>
        </Link>{' '}
        aus.
      </Editorial.P>
    )

  const ownSubmissionId = data?.questionnaire?.results?.nodes[0]?.id
  const isOwnQuestionnaire = ownSubmissionId === submissionId

  if (isOwnQuestionnaire)
    return (
      <Editorial.P>
        Sie können Ihre Antworten jederzeit{' '}
        <Link href={formPath} legacyBehavior>
          <Editorial.A> löschen oder bearbeiten</Editorial.A>
        </Link>
        .
      </Editorial.P>
    )

  return (
    <Editorial.P>
      Sie möchten Ihre eigenen Antworten teilen oder nochmals bearbeiten?{' '}
      <SubmissionLink submissionId={ownSubmissionId}>
        <Editorial.A> Hierlang.</Editorial.A>
      </SubmissionLink>
    </Editorial.P>
  )
}

type OverviewLinkProps = {
  focus?: string
}
export const OverviewLink = ({ focus }: OverviewLinkProps) => {
  const router = useRouter()
  const pathname = getPathname(router)

  return (
    <Interaction.P>
      <Link
        href={{
          pathname,
          query: {
            focus: focus || MAIN_VIEWPORT_FOCUS,
          },
        }}
        passHref
        legacyBehavior
      >
        <Editorial.A>Zurück zur Übersicht</Editorial.A>
      </Link>
    </Interaction.P>
  )
}
