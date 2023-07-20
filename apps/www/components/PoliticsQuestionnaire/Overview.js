import { css } from 'glamor'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { PUBLIC_BASE_URL, ASSETS_SERVER_BASE_URL } from '../../lib/constants'

import Frame from '../Frame'

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
  QUESTION_TYPES,
  QUESTION_SEPARATOR,
  QUESTIONNAIRE_BG_COLOR,
  QUESTIONNAIRE_SQUARE_IMG_URL,
} from './config'
import { QuestionSummaryChart } from '../Questionnaire/Submissions/QuestionChart'

import {
  AnswersGrid,
  AnswersGridCard,
} from '../Questionnaire/Submissions/AnswersGrid'

import HeaderShare from './HeaderShare'

import { ShareImageSplit } from '../Questionnaire/Submissions/ShareImageSplit'

// filter needs to be this text/value object
const CANTONS = [
  { text: 'Alle', value: undefined },
  { text: 'Bern', value: 'BE' },
  { text: 'Wallis', value: 'VS' },
]

const PARTIES = [
  { text: 'Alle', value: undefined },
  { text: 'SVP', value: 'SVP' },
  { text: 'SP', value: 'SP' },
  { text: 'Grüne', value: 'GRÜNE' },
  { text: 'Mitte', value: 'M-E' },
  { text: 'FDP', value: 'FDP-Liberale' },
  { text: 'LDP', value: 'LDP' },
  { text: 'glp', value: 'glp' },
  { text: 'EVP', value: 'EVP' },
]

export const Filters = () => {
  const router = useRouter()
  const query = router.query

  return (
    <NarrowContainer>
      <div {...styles.filterContainer}>
        {/* <Dropdown
          label='Kanton'
          items={CANTONS}
          value={query.canton}
          onChange={(item) =>
            router.push({ query: { ...query, canton: item.value } })
          }
        /> */}
        <Dropdown
          label='Partei'
          items={PARTIES}
          value={query.party}
          onChange={(item) => router.push({ query: { party: item.value } })}
        />
      </div>
    </NarrowContainer>
  )
}

export const SubmissionsOverview = ({ submissionData }) => {
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
    return <ShareImageSplit img={QUESTIONNAIRE_SQUARE_IMG_URL} />
  }

  const meta = {
    url,
    title: 'Politikerfragebogen 2023',
    description: 'Share Beschreibungstext',
    image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
      shareImageUrl,
    )}`,
  }

  return (
    <Frame raw>
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
                Politikerfragebogen 25 Fragen
              </Interaction.Headline>
              <Editorial.Lead>
                Worauf können Sie nicht verzichten, obwohl Sie wissen, dass es
                für das Klima besser wäre? Was hätten Sie gerne schon vor 10
                Jahren über die Klimakrise gewusst? Stöbern Sie durch die
                Vielfalt an Antworten der Republik-Leserinnen.
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
              {/* {author?.profilePicture && (
                <img
                  src={author.profilePicture}
                  style={{
                    marginTop: 30,
                    width: 120,
                    borderRadius: 80,
                  }}
                />
              )} */}
            </NarrowContainer>
          </div>
        </ColorContextProvider>
      </div>
      <div style={{ margin: '48px auto 0' }}>
        <Filters />
        {QUESTIONS.map((question, idx) => {
          const groupQuestions = question.questionSlugs.map((slug) =>
            submissionData.find((d) => d.key === slug),
          )

          return (
            <QuestionFeatured
              key={question.questionSlugs[0]}
              questions={groupQuestions}
              bgColor={questionColor(idx)}
            />
          )
        })}
      </div>
    </Frame>
  )
}

export default SubmissionsOverview

export const getTypeBySlug = (slug) =>
  QUESTION_TYPES.find((q) => q.questionSlug === slug).type

const QuestionFeatured = ({ questions, bgColor }) => {
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
        {questions.map((q) => {
          return getTypeBySlug(q.key) === 'text' ? (
            <AnswerGridOverview question={q} />
          ) : getTypeBySlug(q.key) === 'choice' ? (
            <AnswersChart question={q} />
          ) : null
        })}

        {hasTextAnswer && (
          <NarrowContainer>
            <Interaction.P style={{ textAlign: 'center' }}>
              <QuestionLink questions={questions}>
                <Editorial.A>Alle Antworten lesen</Editorial.A>
              </QuestionLink>
            </Interaction.P>
          </NarrowContainer>
        )}
      </Container>
    </div>
  )
}

const AnswerGridOverview = ({ question }) => {
  const questionSlug = question.key
  return (
    <div style={{ padding: '46px 0' }}>
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
      <ColorContextProvider localColorVariables={colors} colorSchemeKey='light'>
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
      </ColorContextProvider>
    </div>
  )
}

export const QuestionLink = ({ questions, children }) => {
  const link = questions.map((q) => q.key).join(QUESTION_SEPARATOR)
  return (
    <Link href={`/politikfragebogen/frage/${link}`} passHref>
      {children}
    </Link>
  )
}

export const SubmissionLink = ({ id, children }) => {
  return (
    <Link href={`/politikfragebogen/${id}`} passHref>
      {children}
    </Link>
  )
}

const AnswersChart = ({ question, skipTitle }) => {
  const options = question.value[0].options

  const validAnswers = question.value.filter((item) =>
    options.includes(item.answer),
  )

  const totalAnswers = validAnswers.length
  const values = options.map((option) => ({
    answer: option,
    value:
      (question.value.filter((result) => result.answer === option).length ??
        0) / totalAnswers,
  }))

  return (
    <NarrowContainer>
      <div style={{ marginTop: '46px' }}>
        {!skipTitle && (
          <Editorial.Subhead style={{ textAlign: 'center' }}>
            {question.value[0].question}
          </Editorial.Subhead>
        )}
        <div style={{ marginTop: 20 }}>
          <QuestionSummaryChart answers={values} key='answer' />
        </div>
      </div>
    </NarrowContainer>
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
