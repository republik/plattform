import { useEffect, useState } from 'react'
import { css, merge } from 'glamor'

import { fontFamilies, RawHtml, useColorContext } from '@project-r/styleguide'

const HEIGHT = 8

const styles = {
  bar: css({
    height: 8,
    marginTop: -20,
    marginBottom: 20,
    position: 'relative',
  }),
  barInner: css({
    height: '100%',
  }),
  goal: css({
    position: 'absolute',
    top: 0,
    left: 0,
    height: HEIGHT,
    backgroundColor: 'transparent',
    boxSizing: 'content-box',
    borderRight: `2px solid transparent`,
  }),
  currentGoal: css({
    borderRight: 'none',
  }),
  lowerGoal: css({
    borderRightWidth: 2,
    borderRightStyle: 'solid',
  }),
  goalNumber: css({
    fontFamiliy: fontFamilies.sansSerifMedium,
    fontSize: 14,
    lineHeight: '14px',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    textAlign: 'right',
    paddingTop: 12,
    paddingRight: 4,
  }),
  goalBar: css({
    position: 'absolute',
    top: 0,
    left: 0,
    height: 8,
  }),
  box: css({
    position: 'absolute',
    top: 40,
    left: 5,
    right: 5,
    fontFamiliy: fontFamilies.sansSerifMedium,
    fontSize: 14,
    lineHeight: '19px',
    padding: '12px 17px',
  }),
  arrow: css({
    position: 'absolute',
    top: 32,
    right: 15,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '0 4px 8px 4px',
    borderColorTop: 'transparent',
    borderColorRight: 'transparent',
    borderColorLeft: 'transparent',
  }),
  noInteraction: css({
    pointerEvents: 'none',
  }),
}

const widthForGoal = (goal, status, accessor) => {
  return (
    Math.ceil(Math.min(1, status[accessor] / goal[accessor]) * 1000000) /
      10000 +
    '%'
  )
}

const GoalBar = ({ status, goals, accessor, format, showLast, color }) => {
  const [colorScheme] = useColorContext()
  const [hover, setHover] = useState(undefined)
  const [goal, setGoal] = useState(undefined)
  const [uniqueGoals, setUniqueGoals] = useState([])

  useEffect(() => {
    setGoal(goals[goals.length - 1])
    setUniqueGoals(
      goals
        .filter(
          (d, i) => i === goals.findIndex((g) => g[accessor] === d[accessor]),
        )
        .reverse(),
    )
  }, goals)

  useEffect(() => {
    setHover(showLast ? uniqueGoals[0] : undefined)
  }, uniqueGoals)

  if (!goal) return null

  return (
    <div
      {...styles.bar}
      style={{
        zIndex: hover ? 1 : 0,
      }}
      {...colorScheme.set('background', 'divider')}
    >
      <div
        {...styles.barInner}
        {...colorScheme.set('background', 'primary')}
        style={{
          width: widthForGoal(goal, status, accessor),
        }}
      />
      {uniqueGoals.length > 1 &&
        uniqueGoals.map((uniqueGoal, i) => (
          <div
            key={i}
            {...merge(
              styles.goal,
              i === 0 && styles.currentGoal,
              i > 0 && status[accessor] < goal[accessor] && styles.lowerGoal,
            )}
            {...colorScheme.set('borderRightColor', 'default')}
            style={{
              width: widthForGoal(goal, uniqueGoal, accessor),
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              setHover(uniqueGoal)
            }}
            onTouchEnd={() => setHover(undefined)}
            onMouseOver={() => setHover(uniqueGoal)}
            onMouseOut={() => setHover(undefined)}
          >
            {uniqueGoal === hover && (
              <div {...styles.noInteraction}>
                <div
                  {...styles.goalBar}
                  {...colorScheme.set('backgroundColor', 'primaryHover')}
                  style={{
                    width: widthForGoal(uniqueGoal, status, accessor),
                  }}
                />
                <div
                  {...styles.goalNumber}
                  {...colorScheme.set('color', 'primaryHover')}
                  {...colorScheme.set('borderRightColor', 'primaryHover')}
                >
                  {format(uniqueGoal[accessor])}
                </div>
                {!!hover.description && (
                  <div
                    {...styles.arrow}
                    {...colorScheme.set('borderBottomColor', 'primaryHover')}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      {!!hover && !!hover.description && (
        <div
          {...styles.box}
          {...colorScheme.set('backgroundColor', 'primaryHover')}
        >
          <RawHtml
            dangerouslySetInnerHTML={{
              __html:
                '<span style="color: white;">' + hover.description + '</span>',
            }}
          />
        </div>
      )}
    </div>
  )
}

GoalBar.defaultProps = {
  format: (value) => value,
}

export default GoalBar
