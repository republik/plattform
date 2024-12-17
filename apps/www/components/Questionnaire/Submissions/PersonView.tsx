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
import { IconChevronLeft, IconEdit } from '@republik/icons'

import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { useMe } from '../../../lib/context/MeContext'

import Frame from '../../Frame'
import Meta from '../../Frame/Meta'

import { QUESTIONNAIRE_USER_QUERY, QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY } from './graphql'
import { LinkToEditQuestionnaire } from './QuestionFeatured'
import { ShareImageSplit } from './ShareImageSplit'
import PersonViewHeaderShare from './PersonViewHeaderShare'
import {
  SubmissionQa,
  styles as submissionStyles,
} from './Submission'
import { QuestionnaireConfig } from '../types/QuestionnaireConfig'

type PageProps = {
  CONFIG: QuestionnaireConfig
}

const Page = ({ CONFIG }: PageProps) => {
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
  shareImageUrlObj.searchParams.set('image', 'true')
  const shareImageUrl = shareImageUrlObj.toString()

  const { loading, error, data } = useQuery(
    QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY,
    {
      variables: {
        slug: CONFIG.dbSlug,
        id,
        sortBy: 'random',
      },
    },
  )

  const author = data?.questionnaire?.results?.nodes[0]?.displayAuthor
  const slug = author?.slug

  const { data: authorData } = useQuery(QUESTIONNAIRE_USER_QUERY, {
    skip: !slug,
    variables: {
      slug,
    },
  })

  if (image) {
    return (
      <ShareImageSplit
        user={!loading && author}
        img={CONFIG.design.img.urlSquare}
        bgColor={CONFIG.design.bgColor}
        personShareText={CONFIG.personPage.shareText}
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
              router.replace({ pathname: CONFIG.paths.overviewPage })
            }
            return null
          }
          const {
            questionnaire: { questions, results },
          } = data
          const submission = results.nodes[0]
          if (!submission) {
            if (process.browser) {
              router.replace({ pathname: CONFIG.paths.overviewPage })
            }
            return null
          }

          const meta = {
            url,
            title: CONFIG.personPage.metaTitle,
            description: CONFIG.personPage.metaDescription.replace(
              '{name}',
              author?.name,
            ),
            image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
              shareImageUrl,
            )}`,
          }

          // noinspection TypeScriptUnresolvedVariable
          return (
            <>
              <Meta data={meta} />
              <div
                style={{
                  backgroundColor: CONFIG.design.bgColor,
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
                      <FigureImage src={CONFIG.design.img.urlSquare} />
                      <FigureCaption>
                        <FigureByline>{CONFIG.design.img.credit}</FigureByline>
                      </FigureCaption>
                    </Figure>
                    <NarrowContainer style={{ padding: '20px 0' }}>
                      <Interaction.Headline>
                        {CONFIG.personPage.title.replace('{name}', author?.name)}
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
                    <NextLink
                      href={CONFIG.paths.overviewPage}
                      passHref
                      legacyBehavior
                    >
                      <IconButton
                        size={24}
                        label='Zur Übersicht'
                        labelShort='Zur Übersicht'
                        Icon={IconChevronLeft}
                      />
                    </NextLink>
                  </div>
                  <PersonViewHeaderShare meta={meta} />
                  {isOwnQuestionnaire && (
                    <IconButton
                      size={24}
                      label='Bearbeiten'
                      labelShort=''
                      Icon={IconEdit}
                      href={CONFIG.paths.formPage}
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
                  slug={CONFIG.dbSlug}
                  questionnairePath={CONFIG.paths.formPage}
                  personPagePath={CONFIG.paths.personPage}
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
