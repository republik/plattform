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

import {
  QUESTIONNAIRE_USER_QUERY,
  QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY,
} from './graphql'
import { LinkToEditQuestionnaire } from './QuestionFeatured'
import { ShareImageSplit } from './ShareImageSplit'
import PersonViewHeaderShare from './PersonViewHeaderShare'
import { SubmissionQa, styles as submissionStyles } from './Submission'
import { configs } from '../configs'
import { useTranslation } from 'lib/withT'

const Page = () => {
  const [headerHeight] = useHeaderHeight()
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()

  const router = useRouter()
  const {
    query: { slug: configId, id, image },
  } = router

  const CONFIG = configs[configId as string]

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

  const meta = {
    url,
    title: CONFIG.personPage.title,
    description: t('questionnaire/submission/description').replace(
      '{name}',
      author?.name,
    ),
    image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
      shareImageUrl,
    )}`,
  }

  if (image) {
    return (
      <ShareImageSplit
        user={{}}
        img={CONFIG.design.img.urlSquare}
        bgColor={CONFIG.design.bgColor}
        personShareText={`${meta.title}: ${meta.description}`}
        question={undefined}
        fgColor={undefined}
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
                      <Interaction.Headline>{meta.title}</Interaction.Headline>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 20,
                          marginTop: 30,
                          textAlign: 'left',
                        }}
                      >
                        {author?.profilePicture && (
                          <img
                            src={author.profilePicture}
                            style={{
                              width: 80,
                              borderRadius: 80,
                            }}
                            alt='profile picture'
                          />
                        )}
                        <Interaction.H2>{meta.description}</Interaction.H2>
                      </div>
                    </NarrowContainer>
                  </div>
                </ColorContextProvider>
              </div>
              <Center>
                <div
                  {...submissionStyles.header}
                  style={{
                    top: headerHeight as number,
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
                  <PersonViewHeaderShare meta={meta} noLabel={false} />
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
                  personPagePath={`fragebogen/${configId}`}
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
