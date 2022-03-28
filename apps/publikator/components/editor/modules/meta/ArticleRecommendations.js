import React from 'react'
import RepoSearch from '../../utils/RepoSearch'
import withT from '../../../../lib/withT'
import { Label } from '@project-r/styleguide'

const ARTICLE_RECOMMENDATIONS_KEY = 'recommendations'

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
    <div>
      <h2>Article recommendations Heading</h2>
      {recommendedArticles && recommendedArticles.length > 0 && (
        <ul>
          {recommendedArticles.map((val, index) => (
            <li key={val}>
              <span>{JSON.stringify(val, null, 2)}</span>
              <button onClick={() => remove(index)}>remove</button>
              <button
                onClick={() => swapArrayElements(index, index - 1)}
                disabled={index == 0}
              >
                up
              </button>
              <button
                onClick={() => swapArrayElements(index, index + 1)}
                disabled={index === recommendedArticles.length - 1}
              >
                down
              </button>
            </li>
          ))}
        </ul>
      )}
      <Label>Add recommendation</Label>
      <RepoSearch onChange={addSuggestion} />
    </div>
  )
}

export default withT(ArticleRecommendations)
