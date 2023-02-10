import { css } from 'glamor'
import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { clamp } from '../../Audio/helpers/clamp'

function getArrayOfSize(max: number): number[] {
  return Array.from({ length: max }, (_, i) => i + 1)
}

type RewardProgressProps = {
  reached?: number
  max: number
}

const RewardProgress = ({ reached, max }: RewardProgressProps) => {
  const progressMarks = getArrayOfSize(max)

  return (
    <div>
      <ol {...styles.progress}>
        {progressMarks.map((mark) => {
          const isReached = mark <= reached
          return (
            <li key={mark} {...styles.progressStep} data-reached={isReached} />
          )
        })}
      </ol>
      <p {...styles.text}>
        {' '}
        {clamp(reached, 0, max)} von {max} Mitstreiterinnen an Bord geholt.
      </p>
    </div>
  )
}

export default RewardProgress

const styles = {
  progress: css({
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 32,
    border: `2px solid #FFFFFF`,
    overflow: 'hidden',
    height: 42,
    width: '100%',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  }),
  progressStep: css({
    flexGrow: 1,
    display: 'flex',
    '&:not(:last-child)': {
      borderRight: `2px solid #FFFFFF`,
    },
    '&[data-reached="true"]': {
      padding: 5,
      backgroundColor: '#FFFFFF',
    },
  }),
  text: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 22,
    lineHeight: 1.3,
    margin: '8px 0 0 0',
    [mediaQueries.mUp]: {
      fontSize: 27,
      margin: '16px 0 0 0',
    },
  }),
}
