import { useState, useRef } from 'react'
import compose from 'lodash/flowRight'

import {
  Interaction,
  RawHtml,
  fontStyles,
  ExpandMoreIcon,
  plainButtonRule,
} from '@project-r/styleguide'

import { css } from 'glamor'

import withT from '../../lib/withT'

const styles = {
  button: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8,
  }),
  h3: css({
    ...fontStyles.sansSerifMedium18,
  }),
  chevron: css({
    marginTop: 2,
    transform: 'rotate(-90deg)',
    transition: 'transform 0.25s ease-out',
  }),
  content: css({
    height: 0,
    transition: 'height 0.25s ease-out',
    overflow: 'hidden',
  }),
  paragraph: css({
    margin: 0,
    ...fontStyles.sansSerifRegular16,
  }),
}

const CheatSheet = compose(withT)(({ t }) => {
  const [expanded, setExpanded] = useState(false)
  const bodyRef = useRef()
  const bodyHeight =
    bodyRef.current && expanded ? bodyRef.current.clientHeight : 0
  return (
    <>
      <button
        {...styles.button}
        {...plainButtonRule}
        onClick={() => setExpanded(!expanded)}
      >
        <Interaction.H3 {...styles.h3}>{t('search/docs/title')}</Interaction.H3>
        <div {...styles.chevron} style={{ transform: expanded && 'rotate(0)' }}>
          <ExpandMoreIcon size={24} />
        </div>
      </button>
      <div {...styles.content} style={{ height: expanded && bodyHeight }}>
        <p {...styles.paragraph} ref={bodyRef}>
          <RawHtml
            dangerouslySetInnerHTML={{
              __html: t('search/docs/text'),
            }}
          />
        </p>
      </div>
    </>
  )
})

export default CheatSheet
