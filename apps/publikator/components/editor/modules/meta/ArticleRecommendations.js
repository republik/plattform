import React from 'react'
import RepoSearch from '../../utils/RepoSearch'
import withT from '../../../../lib/withT'
import {
  Label,
  IconButton,
  ArrowUpIcon,
  ArrowDownIcon,
  CloseIcon,
} from '@project-r/styleguide'
import { css } from 'glamor'

const ARTICLE_RECOMMENDATIONS_KEY = 'recommendations'

const styles = {
  wrapper: css({
    display: 'inline-block',
  }),
  recommendationList: css({
    margin: '1rem 0',
    padding: 0,
  }),
  recommendationItem: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: '0.5rem 1rem',
    '&:not(:first-child)': {
      marginTop: '0.5rem',
      borderTop: '1px solid #ccc',
    },
  }),
  arrowWrapper: css({
    display: 'inline-flex',
    flexDirection: 'column',
  }),
}

const ArticleRecommendations = ({ t, editor, node }) => {
  const recommendedArticles = node.data.get(ARTICLE_RECOMMENDATIONS_KEY) || []

  const handleSuggestionsChange = (nextState) => {
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data:
          nextState && nextState.length > 0
            ? node.data.set(ARTICLE_RECOMMENDATIONS_KEY, nextState)
            : node.data.remove(ARTICLE_RECOMMENDATIONS_KEY),
      })
    })
  }

  const addSuggestion = (suggestion) => {
    const prefixedSuggestionURL = `https://github.com/${suggestion.value.id}`
    handleSuggestionsChange([...recommendedArticles, prefixedSuggestionURL])
  }

  const remove = (index) => {
    handleSuggestionsChange(recommendedArticles.filter((_, i) => i !== index))
  }

  const swapArrayElements = (indexA, indexB) => {
    const nextState = [...recommendedArticles]

    const smallIndex = Math.min(indexA, indexB)
    const largeIndex = Math.max(indexA, indexB)

    if (
      recommendedArticles.length < 2 ||
      smallIndex === largeIndex ||
      smallIndex < 0 ||
      largeIndex > nextState.length - 1
    ) {
      return
    }

    const a = nextState[smallIndex]
    const b = nextState[largeIndex]
    nextState[smallIndex] = b
    nextState[largeIndex] = a
    handleSuggestionsChange(nextState)
  }

  console.debug('article suggestions', recommendedArticles)

  return (
    <div className={styles.wrapper}>
      <h2>Vorgeschlagene Artikel</h2>
      <div>
        <Label>Artikel hinzufügen</Label>
        <RepoSearch onChange={addSuggestion} />
      </div>
      {recommendedArticles && recommendedArticles.length > 0 && (
        <ul className={styles.recommendationList}>
          {recommendedArticles.map((val, index) => (
            <li key={val} className={styles.recommendationItem}>
              <div className={styles.arrowWrapper}>
                <IconButton
                  Icon={ArrowUpIcon}
                  onClick={() => swapArrayElements(index, index - 1)}
                  disabled={index === 0}
                />
                <IconButton
                  Icon={ArrowDownIcon}
                  onClick={() => swapArrayElements(index, index + 1)}
                  disabled={index === recommendedArticles.length - 1}
                />
              </div>
              <span>{JSON.stringify(val, null, 2)}</span>
              <IconButton Icon={CloseIcon} onClick={() => remove(index)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default withT(ArticleRecommendations)
