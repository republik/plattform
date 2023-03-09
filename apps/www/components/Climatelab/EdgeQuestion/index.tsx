import { css } from 'glamor'
import {
  useColorContext,
  Center,
  Editorial,
  inQuotes,
} from '@project-r/styleguide'
import QuestionScroll from './QuestionScroll'

const styles = {
  grid: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: 60,
  }),
  card: css({
    flex: '1 1 0',
    backgroundColor: 'red',
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
]

type EdgeQuestionProps = { contentPath: string }

const EdgeQuestion: React.FC<EdgeQuestionProps> = ({ contentPath }) => {
  return (
    <Center>
      <CardsOverview data={OVERVIEW_DATA} />
      <QuestionScroll contentPath={contentPath} />
    </Center>
  )
}

const CardsOverview: React.FC<{
  data: Array<{ name: string; excerpt: string }>
}> = ({ data }) => {
  return (
    <div {...styles.grid}>
      {data.map(({ name, excerpt }, idx) => {
        return (
          <div {...styles.card} key={idx}>
            <div>
              <Editorial.Question style={{ marginTop: 0 }}>
                {inQuotes(excerpt)}
              </Editorial.Question>
              <Editorial.Credit
                style={{
                  marginTop: '0',
                  paddingTop: '20px',
                }}
              >
                Von <span style={{ textDecoration: 'underline' }}>{name}</span>
              </Editorial.Credit>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default EdgeQuestion
