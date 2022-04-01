import React, { useState } from 'react'
import RepoSearch from '../../utils/RepoSearch'
import withT from '../../../../lib/withT'
import { Label, A } from '@project-r/styleguide'
import { css } from 'glamor'
import MdAdd from 'react-icons/lib/md/add'
import ArticleRecommendationItem from './ArticleRecommendations/ArticleRecommendationItem'
const ARTICLE_RECOMMENDATIONS_KEY = 'recommendations'

const styles = {
  wrapper: css({
    display: 'block',
  }),
  recommendationList: css({
    margin: '1rem 0',
    padding: 0,
    '> li': {
      listStyle: 'none',
      '&:not(:first-child)': {
        borderTop: '1px solid #ccc',
      },
    },
  }),

  repoSearchWrapper: css({
    marginTop: '1rem',
    width: '100%',
  }),
}

const ArticleRecommendations = ({ t, editor, node }) => {
  const recommendedArticles = node.data.get(ARTICLE_RECOMMENDATIONS_KEY) || []
  const [showRepoSearch, setShowRepoSearch] = useState(false)

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

  const addSuggestion = (suggestion, index = -1) => {
    const prefixedSuggestionURL = `https://github.com/${suggestion.value.id}`
    if (index == -1) {
      handleSuggestionsChange([...recommendedArticles, prefixedSuggestionURL])
    } else {
      handleSuggestionsChange(
        [...recommendedArticles].splice(index, 0, prefixedSuggestionURL),
      )
    }
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
      <h2>Vorgeschlagene Beiträge</h2>

      {recommendedArticles && recommendedArticles.length > 0 && (
        <ul className={styles.recommendationList}>
          {recommendedArticles.map((val, index) => (
            <ArticleRecommendationItem
              key={val}
              repoId={val}
              handleRemove={() => remove(index)}
              handleUp={() => swapArrayElements(index, index - 1)}
              handleDown={() => swapArrayElements(index, index + 1)}
              isFirst={index === 0}
              isLast={index === recommendedArticles.length - 1}
            />
          ))}
          {showRepoSearch && (
            <li>
              <div {...styles.repoSearchWrapper}>
                <Label>Beitrag suchen</Label>
                <RepoSearch
                  onChange={(value) => {
                    setShowRepoSearch(false)
                    addSuggestion(value)
                  }}
                />
              </div>
            </li>
          )}
        </ul>
      )}
      <A href='#add' onClick={() => setShowRepoSearch(true)} {...styles.add}>
        <MdAdd /> Beitrag hinzufügen
      </A>
    </div>
  )
}

export default withT(ArticleRecommendations)
