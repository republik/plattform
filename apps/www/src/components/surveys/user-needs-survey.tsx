import { Button } from '@app/components/ui/button'
import { css } from '@republik/theme/css'
import { useState } from 'react'

const HAPPY_COLOR = '#FB38B5'
const UNHAPPY_COLOR = '#102176'

const UserNeedsSurvey = () => {
  const [question, setQuestion] = useState<{ text: string; answer: string }>({
    text: 'Nehmen Sie etwas aus dem Beitrag mit?',
    answer: '',
  })
  const [survey, setSurvey] = useState<
    { text: string; selected: boolean; sentiment: 'happy' | 'unhappy' }[]
  >([
    { text: 'Stilvoll', selected: false, sentiment: 'happy' },
    { text: 'Inspirierend', selected: false, sentiment: 'happy' },
    { text: 'Nichts neues', selected: false, sentiment: 'unhappy' },
    { text: 'Aha-Moment', selected: false, sentiment: 'happy' },
    { text: 'Berührend', selected: false, sentiment: 'happy' },
    { text: 'Zieht sich', selected: false, sentiment: 'unhappy' },
    { text: 'Hilfreich', selected: false, sentiment: 'happy' },
    { text: 'Verwirrend', selected: false, sentiment: 'unhappy' },
  ])

  return (
    <div>
      <div>
        <h2 className={css({ textStyle: 'h2Sans' })}>{question.text}</h2>
        <div
          className={css({
            display: 'flex',
            gap: '4',
            marginBottom: '4',
            marginTop: '2',
          })}
        >
          <Button
            onClick={() => setQuestion({ ...question, answer: 'Ja' })}
            style={
              question.answer === 'Ja'
                ? { backgroundColor: HAPPY_COLOR }
                : { color: HAPPY_COLOR }
            }
            variant={question.answer === 'Ja' ? 'default' : 'outline'}
            size='large'
          >
            Ja
          </Button>
          <Button
            onClick={() => setQuestion({ ...question, answer: 'Nein' })}
            style={
              question.answer === 'Nein'
                ? { backgroundColor: UNHAPPY_COLOR }
                : { color: UNHAPPY_COLOR }
            }
            variant={question.answer === 'Nein' ? 'default' : 'outline'}
            size='large'
          >
            Nein
          </Button>
        </div>
        <p>12'329 Leserinnen fanden den Beitrag lesenwert.</p>
      </div>
      <div
        className={css({
          marginTop: '8',
        })}
      >
        <p>Im Detail:</p>
        <div
          className={css({
            display: 'flex',
            gap: '4',
            marginBottom: '4',
            marginTop: '2',
          })}
        >
          {survey.map((item) => (
            <Button
              key={item.text}
              onClick={() => {
                setSurvey(
                  survey.map((i) =>
                    i.text === item.text ? { ...i, selected: !i.selected } : i,
                  ),
                )
              }}
              style={
                item.selected
                  ? {
                      backgroundColor:
                        item.sentiment === 'unhappy'
                          ? UNHAPPY_COLOR
                          : HAPPY_COLOR,
                    }
                  : {
                      color:
                        item.sentiment === 'unhappy'
                          ? UNHAPPY_COLOR
                          : HAPPY_COLOR,
                    }
              }
              variant={item.selected ? 'default' : 'outline'}
              size='small'
            >
              {item.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserNeedsSurvey
