import { useRouter } from 'next/router'

import NextLink from 'next/link'

import { screenshotUrl } from '@app/lib/util/screenshot-api'
import {
  Center,
  ColorContextProvider,
  Editorial,
  Interaction,
  colors,
  convertStyleToRem,
  fontStyles,
  inQuotes,
  mediaQueries,
} from '@project-r/styleguide'

import { css } from 'glamor'

import { AnswersChart, SubmissionLink } from './shared'

import Frame from '../Frame'
import Meta from '../Frame/Meta'
import { ShareImage } from '../Questionnaire/Submissions/components/ShareImage'

import { PUBLIC_BASE_URL } from '../../lib/constants'
import {
  ILLU_SHARE,
  OVERVIEW_QUESTIONNAIRE_PATH,
  QUESTIONNAIRE_FG_COLOR,
  questionColor,
} from './config'

const Page = ({
  question,
  chartAnswers,
  nestedResponses,
  questionTypes,
  questionIndex,
}) => {
  const router = useRouter()
  const {
    query: { image },
  } = router

  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('image', true)
  const shareImageUrl = shareImageUrlObj.toString()

  if (image) {
    return (
      <ShareImage
        text={question}
        img={ILLU_SHARE}
        bgColor={questionColor(questionIndex)}
        fgColor={QUESTIONNAIRE_FG_COLOR}
      />
    )
  }

  const isChoiceQuestion = questionTypes.includes('choice')
  const twoTextQuestions = !isChoiceQuestion && questionTypes.length > 1

  const meta = {
    url,
    title: question,
    description: 'Politikfragebogen für Politiker',
    image: screenshotUrl({ url: shareImageUrl, width: 1200 }),
  }

  return (
    <Frame raw>
      <Meta data={meta} />
      <ColorContextProvider localColorVariables={colors} colorSchemeKey='light'>
        <div>
          <div style={{ backgroundColor: questionColor(questionIndex) }}>
            <div
              style={{
                marginTop: 48,
                marginBottom: 20,
                paddingTop: 24,
              }}
              // ref={containerRef}
            >
              <Center>
                <div
                  style={{
                    paddingTop: 24,
                    textAlign: 'center',
                  }}
                >
                  <Interaction.P>
                    <NextLink
                      href={OVERVIEW_QUESTIONNAIRE_PATH}
                      passHref
                      legacyBehavior
                    >
                      <Editorial.A>Zurück zur Übersicht</Editorial.A>
                    </NextLink>
                  </Interaction.P>
                  <Editorial.Subhead>
                    {nestedResponses[0].values[0].question}
                    {twoTextQuestions && (
                      <>
                        <hr
                          style={{
                            opacity: 0.7,
                            margin: '1.2em 33%',
                            border: 0,
                            borderTop: '1px solid currentColor',
                          }}
                        />
                        <span>{nestedResponses[0].values[1].question}</span>
                      </>
                    )}
                  </Editorial.Subhead>

                  {isChoiceQuestion && (
                    <>
                      <AnswersChart question={chartAnswers} skipTitle={true} />
                      <br />
                      <Editorial.Subhead style={{ textAlign: 'center' }}>
                        {nestedResponses[0].values[1].question}
                      </Editorial.Subhead>
                    </>
                  )}
                </div>
                <div {...styles.answerCardWrapper}>
                  {nestedResponses.map(({ key, values }) => (
                    <SubmissionLink key={key} id={key}>
                      <a style={{ textDecoration: 'none' }}>
                        <div {...styles.answerCard}>
                          <ColorContextProvider
                            localColorVariables={colors}
                            colorSchemeKey='light'
                          >
                            <div
                              {...(!isChoiceQuestion &&
                                styles.answerCardContent)}
                            >
                              {values.map(({ answer }, idx) => {
                                return (
                                  <div key={answer.id}>
                                    {isChoiceQuestion && !idx ? (
                                      <div {...styles.circleLabel}>
                                        <span {...styles.circle} />
                                        {answer}
                                      </div>
                                    ) : (
                                      <div
                                        {...(isChoiceQuestion &&
                                          styles.answerCardContent)}
                                      >
                                        {inQuotes(answer)}

                                        {idx === 0 && twoTextQuestions && (
                                          <hr
                                            style={{
                                              opacity: 0.3,
                                              margin: '1.2em 33%',
                                              border: 0,
                                              borderTop:
                                                '1px solid currentColor',
                                            }}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}

                              <Editorial.Credit
                                style={{
                                  marginTop: '0',
                                  paddingTop: '10px',
                                }}
                              >
                                Von{' '}
                                <span
                                  style={{
                                    textDecoration: 'underline',
                                  }}
                                >
                                  {values[0].name}
                                </span>
                              </Editorial.Credit>
                            </div>
                          </ColorContextProvider>
                        </div>
                      </a>
                    </SubmissionLink>
                  ))}
                </div>
              </Center>
            </div>
          </div>
        </div>
      </ColorContextProvider>
    </Frame>
  )
}

export default Page

const styles = {
  answerCardWrapper: css({
    marginTop: 40,
  }),
  answerCard: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 30,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 20,
    transition: 'all .3s ease-in-out',
    ':hover': {
      transform: 'scale(1.03) !important',
      '& span': {
        color: '#757575',
      },
    },
  }),
  answerCardContent: css({
    overflowWrap: 'break-word',
    hyphens: 'manual',
    ...convertStyleToRem(fontStyles.serifBold17),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.serifBold19),
    },
  }),
  circleLabel: css({
    ...fontStyles.sansSerifRegular16,
    marginBottom: 20,
  }),
  circle: css({
    display: 'inline-block',
    borderRadius: '50%',
    width: '10px',
    height: '10px',
    marginRight: 5,
    backgroundColor: `currentColor`,
    opacity: 0.7,
  }),
}
