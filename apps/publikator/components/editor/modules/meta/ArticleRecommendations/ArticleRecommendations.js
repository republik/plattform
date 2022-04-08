import { useState } from 'react'
import RepoSearch from '../../../utils/RepoSearch'
import withT from '../../../../../lib/withT'
import { A, Interaction, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import MdAdd from 'react-icons/lib/md/add'
import ArticleRecommendationItem from './ArticleRecommendationItem'
import { getAbsoluteRepoUrl } from './util/RepoLinkUtility'
import { useRouter } from 'next/router'
import { swapArrayElements } from './util/ArraySwapElementsUtility'

const ARTICLE_RECOMMENDATIONS_KEY = 'recommendations'

const styles = {
  title: css({
    marginBottom: '1rem',
  }),
  wrapper: css({
    display: 'block',
  }),
  recommendationList: css({
    margin: '1rem 0',
    padding: 0,
    '> li': {
      listStyle: 'none',
      borderTop: '1px solid #ccc',
    },
  }),
  repoSearchWrapper: css({
    marginTop: '1rem',
    width: '100%',
  }),
}

const ArticleRecommendations = ({ t, editor, node }) => {
  const [colorScheme] = useColorContext()
  const { asPath } = useRouter()
  const ownRepoId = getAbsoluteRepoUrl(
    asPath?.slice(0, asPath.indexOf('/edit?commitId')).replace('/repo/', ''),
  )
  const recommendationsMetaData = node.data.get(ARTICLE_RECOMMENDATIONS_KEY)
  const recommendedArticles = recommendationsMetaData || []
  const [showRepoSearch, setShowRepoSearch] = useState(false)

  const isSeries = !!node.data.get('series')
  const usedTemplate = node.data.get('template')
  const isSupportedTemplate =
    usedTemplate === 'article' || usedTemplate === 'page'
  const shouldBeEnabled = isSupportedTemplate && !isSeries

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
    const prefixedSuggestionURL = getAbsoluteRepoUrl(suggestion.value.id)
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

  const exchangeElements = (indexA, indexB) => {
    const nextState = swapArrayElements(
      [...recommendedArticles],
      indexA,
      indexB,
    )
    handleSuggestionsChange(nextState)
  }

  return (
    <div {...styles.wrapper}>
      <Interaction.H3 {...styles.title}>
        {t('metaData/recommendations/heading')}
      </Interaction.H3>
      {
        // Even if recommended-articles shouldn't be available based on the article type,
        // one can override it by manually adding the recommended-articles key into the source-code
        shouldBeEnabled ||
        (recommendationsMetaData && Array.isArray(recommendationsMetaData)) ? (
          <>
            {(recommendedArticles?.length > 0 || showRepoSearch) && (
              <>
                <p>{t('metaData/recommendations/info')}</p>
                <ul {...styles.recommendationList}>
                  {recommendedArticles.map((val, index) => (
                    <ArticleRecommendationItem
                      key={val + index}
                      t={t}
                      repoId={val}
                      handleRemove={() => remove(index)}
                      handleUp={() => exchangeElements(index, index - 1)}
                      handleDown={() => exchangeElements(index, index + 1)}
                      isFirst={index === 0}
                      isLast={index === recommendedArticles.length - 1}
                      isDuplicate={recommendedArticles.indexOf(val) !== index}
                      isRedundant={val === ownRepoId}
                    />
                  ))}
                  {showRepoSearch && (
                    <li>
                      <div {...styles.repoSearchWrapper}>
                        <RepoSearch
                          label={t('metaData/recommendations/search')}
                          onChange={(value) => {
                            setShowRepoSearch(false)
                            addSuggestion(value)
                          }}
                        />
                      </div>
                    </li>
                  )}
                </ul>
              </>
            )}
            <A
              href='#add'
              onClick={() => setShowRepoSearch(true)}
              {...styles.add}
            >
              <MdAdd /> {t('metaData/recommendations/add')}
            </A>
          </>
        ) : (
          <p {...colorScheme.set('color', 'textSoft')}>
            {t('metaData/recommendations/disabled')}
          </p>
        )
      }
    </div>
  )
}

export default withT(ArticleRecommendations)
