import React, { useState, useMemo } from 'react'
import { css } from 'glamor'

import { useColorContext } from '../../Colors/ColorContext'
import { fontStyles } from '../../Typography'

import ChartEditor from '.'

const styles = {
  orderBy: css(plainButtonRule, {
    ...fontStyles.sansSerifRegular16,
    marginRight: '20px'
  }),
  regular: css({
    textDecoration: 'none'
  }),
  selected: css({
    textDecoration: 'underline',
    textDecorationSkip: 'ink'
  }),
  tabs: css({
    margin: '20px 0px'
  })
}

const tabs = [
  { value: 'basic', text: 'Grundeinstellungen' },
  {
    value: 'advanced',
    text: 'Erweiterte Optionen'
  }
]

const EditorWrapper = ({ data, value, onChange }) => {
  const [colorScheme] = useColorContext()
  const [activeTab, setActiveTab] = useState('basic')

  const handleTabClick = item => {
    setActiveTab(item.target.value)
  }

  const hoverRule = useMemo(() => {
    return css({
      '@media (hover)': {
        ':hover': {
          color: colorScheme.getCSSColor('textSoft')
        }
      }
    })
  }, [colorScheme])

  return (
    <>
      <div {...styles.tabs}>
        {tabs.map(d => {
          return (
            <button
              key={d.value}
              {...styles.orderBy}
              {...colorScheme.set('color', 'text')}
              {...styles[activeTab === d.value ? 'selected' : 'regular']}
              {...(activeTab !== d.value && hoverRule)}
              value={d.value}
              onClick={handleTabClick}
            >
              {d.text}
            </button>
          )
        })}
      </div>
      <ChartEditor
        data={data}
        value={value}
        onChange={onChange}
        activeTab={activeTab}
      />
    </>
  )
}

export default EditorWrapper
