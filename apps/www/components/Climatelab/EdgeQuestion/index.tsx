import { css } from 'glamor'
import {
  useColorContext,
  Center,
  Editorial,
  inQuotes,
  slug,
  Breakout,
  Container,
} from '@project-r/styleguide'
import QuestionScroll from './QuestionScroll'
import NextLink from 'next/link'
import {
  AnswersGrid,
  AnswersGridCard,
} from '../../Questionnaire/Submissions/AnswersGrid'

const styles = {
  card: css({
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
}

const OVERVIEW_DATA = [
  {
    name: 'Rebecca Solnit',
    excerpt:
      'Die große Mehrheit der Menschen auf der Erde lebt ohnehin in Armut.',
  },
  {
    name: 'Marcel Hänggi',
    excerpt: 'Ich wünschte mir mehr gesellschaftspolitische Vorstellungskraft.',
  },
  {
    name: 'Rebecca Solnit',
    excerpt:
      'Die große Mehrheit der Menschen auf der Erde lebt ohnehin in Armut.',
  },
  {
    name: 'Marcel Hänggi',
    excerpt: 'Ich wünschte mir mehr gesellschaftspolitische Vorstellungskraft.',
  },
  {
    name: 'Rebecca Solnit',
    excerpt: 'Die große Mehrheit der Menschen',
  },
  {
    name: 'Marcel Hänggi',
    excerpt: 'Gesellschaftspolitische Vorstellungskraft',
  },
]

type EdgeQuestionProps = { contentPath: string }

const EdgeQuestion: React.FC<EdgeQuestionProps> = ({ contentPath }) => {
  const [colorScheme] = useColorContext()
  return (
    <>
      <div
        {...colorScheme.set('background-color', 'divider')}
        style={{
          // backgroundColor: '#5A47E1',
          margin: '0 auto',
          padding: '46px 0',
        }}
      >
        <Container>
          <CardsOverview data={OVERVIEW_DATA} />
        </Container>
      </div>
      <Center>
        <QuestionScroll contentPath={contentPath} />
      </Center>
    </>
  )
}

const CardsOverview: React.FC<{
  data: Array<{ name: string; excerpt: string }>
}> = ({ data }) => {
  return (
    <AnswersGrid>
      {data.map(({ name, excerpt }, idx) => {
        return (
          <AnswersGridCard key={idx}>
            <NextLink href={`#${slug(name)}`}>
              <a style={{ textDecoration: 'none' }}>
                <div {...styles.card}>
                  <div>
                    <Editorial.Question
                      style={{ marginTop: 0, color: 'black' }}
                    >
                      {inQuotes(excerpt)}
                    </Editorial.Question>
                    <Editorial.Credit
                      style={{
                        marginTop: '0',
                        paddingTop: '20px',
                        color: 'black',
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
            </NextLink>
          </AnswersGridCard>
        )
      })}
    </AnswersGrid>
  )
}

export default EdgeQuestion
