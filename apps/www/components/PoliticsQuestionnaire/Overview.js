import { useMemo } from 'react'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import { PUBLIC_BASE_URL, ASSETS_SERVER_BASE_URL } from '../../lib/constants'

import Frame from '../Frame'
import Meta from '../Frame/Meta'

import {
  ColorContextProvider,
  colors,
  Editorial,
  inQuotes,
  Interaction,
  NarrowContainer,
  Container,
  Dropdown,
  Figure,
  FigureImage,
  FigureCaption,
  FigureByline,
} from '@project-r/styleguide'

import {
  questionColor,
  QUESTIONS,
  QUESTIONNAIRE_BG_COLOR,
  QUESTIONNAIRE_SQUARE_IMG_URL,
  ILLU_SHARE,
  ILLU_CREDIT,
  QUESTIONNAIRE_FG_COLOR,
} from './config'

import { QuestionLink, SubmissionLink, AnswersChart } from './shared'

import {
  AnswersGrid,
  AnswersGridCard,
} from '../Questionnaire/Submissions/AnswersGrid'

import HeaderShare from './HeaderShare'

import { ShareImageSplit } from '../Questionnaire/Submissions/ShareImageSplit'
import { getTypeBySlug } from './utils'

// filter needs to be this text/value object
const PARTIES = [
  { text: 'Alle', value: undefined },
  { text: 'SVP', value: 'SVP' },
  { text: 'SP', value: 'SP' },
  { text: 'Grüne', value: 'Gruene' },
  { text: 'Die Mitte', value: 'Mitte' },
  { text: 'FDP', value: 'FDP' },
  { text: 'LDP', value: 'LDP' },
  { text: 'GLP', value: 'glp' },
  { text: 'EVP', value: 'EVP' },
]

const Filters = ({ party, availableParties }) => {
  const router = useRouter()

  return (
    <NarrowContainer>
      <div {...styles.filterContainer}>
        <Dropdown
          label='Partei'
          items={PARTIES.filter(
            (p) => !p.value || availableParties.includes(p.value),
          )}
          value={party ? PARTIES[party] || party : undefined}
          onChange={(item) => {
            if (item.value) {
              router.push(
                `/politikfragebogen/partei/${encodeURIComponent(item.value)}`,
              )
            } else {
              router.push(`/politikfragebogen`)
            }
          }}
        />
      </div>
    </NarrowContainer>
  )
}

const SubmissionsOverview = ({ submissionData, party, availableParties }) => {
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
      <ShareImageSplit
        img={ILLU_SHARE}
        fgColor={QUESTIONNAIRE_FG_COLOR}
        bgColor={QUESTIONNAIRE_BG_COLOR}
        question={{
          text: `Was Sie von den Schweizer Politikern schon immer wissen wollten${
            party ? ` - ${party}` : ''
          }`,
        }}
      />
    )
  }

  const meta = {
    url,
    title: 'Die 71 ausgefüllten Sommerfragebögen 2023',
    description: 'Hier finden Sie alle Antworten gebündelt.',
    image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
      shareImageUrl,
    )}`,
  }

  return (
    <Frame raw>
      <Meta data={meta} />
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px 0 0',
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
                <FigureByline>{ILLU_CREDIT}</FigureByline>
              </FigureCaption>
            </Figure>
            <NarrowContainer style={{ padding: '20px 0' }}>
              <Interaction.Headline>
                Wir hatten 25 Fragen – hier sind alle Antworten aus dem
                Bundeshaus
              </Interaction.Headline>
              <Editorial.Lead>
                Politische Irrtümer und bevorzugte Ferienorte, sympathische
                Gegnerinnen und die politische Haltung in einem Satz: 71
                Politikerinnen haben unseren Sommerfragebogen ausgefüllt. Hier
                finden Sie alle gebündelt.
              </Editorial.Lead>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 20,
                }}
              >
                <HeaderShare meta={meta} />
              </div>
            </NarrowContainer>
          </div>

          <div
            style={{
              margin: '48px auto 0',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Filters party={party} availableParties={availableParties} />
            {QUESTIONS.map((question, idx) => {
              const groupQuestions = question.questionSlugs.map((slug) =>
                submissionData.find((d) => d.key === slug),
              )

              return (
                <QuestionFeatured
                  key={question.questionSlugs[0]}
                  questions={groupQuestions}
                  bgColor={questionColor(idx)}
                  hideShowAll={!!party}
                />
              )
            })}
            <NarrowContainer style={{ padding: '20px 0' }}>
              <Editorial.P>
                Wir haben den Sommerfragebogen auch für die Verlegerschaft
                bereitgestellt.{' '}
                <Editorial.A href='https://www.republik.ch/politik-in-26-fragen-ihre-antworten'>
                  Hier
                </Editorial.A>{' '}
                finden Sie alle ausgefüllten Fragebögen der Leserinnen.
              </Editorial.P>
            </NarrowContainer>
          </div>
        </ColorContextProvider>
      </div>
    </Frame>
  )
}

export default SubmissionsOverview

const QuestionFeatured = ({ questions, bgColor, hideShowAll = false }) => {
  // Because we filter by NA we get undefined for certain answers, so we exclude those answers from the overview
  if (typeof questions[0] === 'undefined') return
  if (questions.length > 1 && typeof questions[1] === 'undefined') return

  const questionTypes = questions.map((q) => getTypeBySlug(q.key))

  const hasTextAnswer = questionTypes.includes('text')

  return (
    <div
      style={{
        // flexBasis: '50%',
        backgroundColor: bgColor,
        display: 'flex',
        padding: '0 0 46px 0',
      }}
    >
      <Container>
        <ColorContextProvider
          localColorVariables={colors}
          colorSchemeKey='light'
        >
          {questions.map((q) => {
            return getTypeBySlug(q.key) === 'text' ? (
              <AnswerGridOverview question={q} />
            ) : getTypeBySlug(q.key) === 'choice' ? (
              <AnswersChart question={q} />
            ) : null
          })}

          {!hideShowAll && hasTextAnswer && (
            <NarrowContainer>
              <Interaction.P style={{ textAlign: 'center' }}>
                <QuestionLink questions={questions}>
                  <Editorial.A>Alle Antworten lesen</Editorial.A>
                </QuestionLink>
              </Interaction.P>
            </NarrowContainer>
          )}
        </ColorContextProvider>
      </Container>
    </div>
  )
}

const AnswerGridOverview = ({ question }) => {
  const questionSlug = question.key
  return (
    <div style={{ padding: '46px 0 0 0' }}>
      <NarrowContainer>
        <Editorial.Subhead style={{ textAlign: 'center' }}>
          {question.value[0].question}
        </Editorial.Subhead>
        {/* {hint && (
          <Interaction.P style={{ textAlign: 'center', fontSize: '1em' }}>
            {hint}
          </Interaction.P>
        )} */}
      </NarrowContainer>
      <AnswersGrid>
        {question.value.map(({ uuid, answer, name }) => (
          <AnswersGridCard key={`${questionSlug}-${uuid}`}>
            <SubmissionLink id={uuid}>
              <a style={{ textDecoration: 'none' }}>
                <div {...styles.answerCard}>
                  <div>
                    <Editorial.Question style={{ marginTop: 0 }}>
                      {inQuotes(answer)}
                    </Editorial.Question>
                    <Editorial.Credit
                      style={{
                        marginTop: '0',
                        paddingTop: '20px',
                      }}
                    >
                      Von{' '}
                      <span style={{ textDecoration: 'underline' }}>
                        {name}
                      </span>
                    </Editorial.Credit>
                  </div>
                </div>
              </a>
            </SubmissionLink>
          </AnswersGridCard>
        ))}
      </AnswersGrid>
    </div>
  )
}

const styles = {
  answerCard: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 24,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  }),
  filterContainer: css({
    marginBottom: 20,
    display: 'flex',
    gap: 30,
    '& > div': {
      flexGrow: 1,
    },
  }),
}
