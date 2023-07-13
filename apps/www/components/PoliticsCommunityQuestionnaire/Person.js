import { gql } from 'graphql-tag'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { useQuery } from '@apollo/client'

import {
  Loader,
  Interaction,
  IconButton,
  Center,
  Figure,
  FigureImage,
  useHeaderHeight,
  useColorContext,
  NarrowContainer,
  FigureCaption,
  ColorContextProvider,
  FigureByline,
} from '@project-r/styleguide'

import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'
import { useMe } from '../../lib/context/MeContext'
import { useTranslation } from '../../lib/withT'

import Frame from '../Frame'
import Meta from '../Frame/Meta'

import { QUESTIONNAIRE_SUBMISSIONS_QUERY } from '../Questionnaire/Submissions/graphql'
import { LinkToEditQuestionnaire } from '../Questionnaire/Submissions/QuestionFeatured'
import { ShareImageSplit } from '../Questionnaire/Submissions/ShareImageSplit'
import {
  SubmissionQa,
  styles as submissionStyles,
} from '../Questionnaire/Submissions/Submission'

import HeaderShare from '../Climatelab/shared/HeaderShare'

import {
  EDIT_QUESTIONNAIRE_PATH,
  OVERVIEW_QUESTIONNAIRE_PATH,
  QUESTIONNAIRE_BG_COLOR,
  QUESTIONNAIRE_SLUG,
  QUESTIONNAIRE_SQUARE_IMG_URL,
  PERSON_PAGE_PATH,
} from './config'
import { IconChevronLeft, IconEdit } from '@republik/icons'

const USER_QUERY = gql`
  query getUserId($slug: String!) {
    user(slug: $slug) {
      id
      name
      statement
      portrait
    }
  }
`

const Page = () => {
  const { t } = useTranslation()
  const [headerHeight] = useHeaderHeight()
  const [colorScheme] = useColorContext()

  const router = useRouter()
  const {
    query: { id, image },
  } = router

  const { me } = useMe()

  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('image', true)
  const shareImageUrl = shareImageUrlObj.toString()

  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug: QUESTIONNAIRE_SLUG,
      id,
      sortBy: 'random',
    },
  })

  const author = data?.questionnaire?.results?.nodes[0]?.displayAuthor
  const slug = author?.slug

  const { data: authorData } = useQuery(USER_QUERY, {
    skip: !slug,
    variables: {
      slug,
    },
  })

  if (image) {
    return (
      <ShareImageSplit
        user={!loading && author}
        img={QUESTIONNAIRE_SQUARE_IMG_URL}
      />
    )
  }

  const isOwnQuestionnaire = me?.id === authorData?.user?.id

  return (
    <Frame raw>
      <Loader
        loading={loading}
        render={() => {
          if (error) {
            if (process.browser) {
              router.replace({ pathname: OVERVIEW_QUESTIONNAIRE_PATH })
            }
            return null
          }
          const {
            questionnaire: { questions, results },
          } = data
          const submission = results.nodes[0]
          if (!submission) {
            if (process.browser) {
              router.replace({ pathname: OVERVIEW_QUESTIONNAIRE_PATH })
            }
            return null
          }

          const meta = {
            url,
            title: t('Climatelab/Questionnaire/title'),
            description: t('Climatelab/Questionnaire/description', {
              name: author?.name,
            }),
            image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
              shareImageUrl,
            )}`,
          }

          return (
            <>
              <Meta data={meta} />
              <div
                style={{
                  backgroundColor: QUESTIONNAIRE_BG_COLOR,
                  padding: '24px 0 24px',
                }}
              >
                <ColorContextProvider colorSchemeKey='light'>
                  <div
                    style={{
                      paddingTop: 24,
                      textAlign: 'center',
                    }}
                  >
                    <Figure
                      size='tiny'
                      attributes={{ style: { position: 'relative' } }}
                    >
                      <FigureImage src={QUESTIONNAIRE_SQUARE_IMG_URL} />
                      <FigureCaption>
                        <FigureByline>Cristina Spanò</FigureByline>
                      </FigureCaption>
                    </Figure>
                    <NarrowContainer style={{ padding: '20px 0' }}>
                      <Interaction.Headline>
                        {t('Climatelab/Questionnaire/Person/title', {
                          name: author?.name,
                        })}
                      </Interaction.Headline>
                      {author?.profilePicture && (
                        <img
                          src={author.profilePicture}
                          style={{
                            marginTop: 30,
                            width: 120,
                            borderRadius: 80,
                          }}
                        />
                      )}
                    </NarrowContainer>
                  </div>
                </ColorContextProvider>
              </div>
              <Center>
                <div
                  {...submissionStyles.header}
                  style={{
                    top: headerHeight,
                    padding: '10px 0',
                    margin: '10px 0 0',
                  }}
                  {...colorScheme.set('backgroundColor', 'default')}
                >
                  <div {...submissionStyles.headerText}>
                    <NextLink href={OVERVIEW_QUESTIONNAIRE_PATH} passHref>
                      <IconButton
                        size={24}
                        label='Zur Übersicht'
                        labelShort='Zur Übersicht'
                        Icon={IconChevronLeft}
                      />
                    </NextLink>
                  </div>
                  <HeaderShare meta={meta} />
                  {isOwnQuestionnaire && (
                    <IconButton
                      size={24}
                      label='Bearbeiten'
                      labelShort=''
                      Icon={IconEdit}
                      href={EDIT_QUESTIONNAIRE_PATH}
                    />
                  )}
                </div>

                {submission?.answers?.nodes.map(
                  ({ id, question: { id: qid }, payload }) => {
                    const question = questions.find((q) => q.id === qid)
                    return (
                      <SubmissionQa
                        key={id}
                        question={question}
                        payload={payload}
                      />
                    )
                  },
                )}
                <LinkToEditQuestionnaire
                  slug={QUESTIONNAIRE_SLUG}
                  questionnairePath={EDIT_QUESTIONNAIRE_PATH}
                  personPagePath={PERSON_PAGE_PATH}
                  newOnly
                />
                <br />
              </Center>
            </>
          )
        }}
      />
    </Frame>
  )
}

export default Page
