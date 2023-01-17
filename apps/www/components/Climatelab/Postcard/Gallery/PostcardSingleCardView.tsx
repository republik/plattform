import { useEffect, useState } from 'react'

import { css } from 'glamor'
import {
  useColorContext,
  Loader,
  Interaction,
  convertStyleToRem,
  fontStyles,
} from '@project-r/styleguide'
import AssetImage from '../../../../lib/images/AssetImage'
import {
  HighlightedPostcard,
  Postcard,
  useSinglePostcardData,
} from './../use-postcard-data'
import PostcardFilter from './PostcardFilter'
import { postcardCredits } from '../../config'
import { useTranslation } from '../../../../lib/withT'
import { PostcardPreview } from '../PostcardPreview'

const styles = {
  container: css({
    position: 'relative',
    margin: '0 auto',
    padding: '15px',
  }),
  buttonWrapper: css({
    position: 'sticky',
    zIndex: 30,
    bottom: 0,
    padding: '15px',
    margin: '0 -15px',
  }),
  buttonContainer: css({
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    gap: '1rem',
  }),
  image: css({
    position: 'relative',
    margin: '0 0 30px',
    '> span': { display: 'block !important' },
  }),
  count: css({
    marginTop: '5px',
    width: '100%',
    textAlign: 'right',
    fontSize: '1rem',
  }),
  label: css({
    ...convertStyleToRem(fontStyles.sansSerifRegular16),
    marginBottom: '20px',
  }),
}

type PostcardSingleCardView = {
  postcard?: Postcard
  isDesktop?: boolean
  highlightedPostcards?: HighlightedPostcard[]
  label?: string
}

const PostcardSingleCardView: React.FC<PostcardSingleCardView> = ({
  postcard,
  isDesktop,
  highlightedPostcards,
  label,
}) => {
  const [colorScheme] = useColorContext()
  const data = {
    postcard_1: useSinglePostcardData({
      highlightedPostcards: highlightedPostcards,
      subjectFilter: 'postcard_1',
    }),
    postcard_2: useSinglePostcardData({
      highlightedPostcards: highlightedPostcards,
      subjectFilter: 'postcard_2',
    }),
    postcard_3: useSinglePostcardData({
      highlightedPostcards: highlightedPostcards,
      subjectFilter: 'postcard_3',
    }),
    postcard_4: useSinglePostcardData({
      highlightedPostcards: highlightedPostcards,
      subjectFilter: 'postcard_4',
    }),
  }

  const [currentPostcard, setCurrentPostcard] = useState<
    keyof typeof data | null
  >(postcard ? null : 'postcard_1')

  const currentPostcardData = data[currentPostcard]

  const { t } = useTranslation()

  let loadedPostcard = null
  if (currentPostcardData?._state === 'LOADED') {
    loadedPostcard = currentPostcardData.postcard
  }

  useEffect(() => {
    if (currentPostcardData?._state === 'LOADED' && !loadedPostcard) {
      console.log('empty postcard, fetching next')
      currentPostcardData.fetchNext()
    }
  }, [loadedPostcard, currentPostcardData])

  return (
    <div {...styles.container}>
      {currentPostcardData ? (
        <Loader
          loading={currentPostcardData._state === 'LOADING'}
          error={currentPostcardData._state === 'ERROR'}
          render={() => {
            return (
              <PostcardContent
                postcard={loadedPostcard}
                t={t}
                isDesktop={isDesktop}
              />
            )
          }}
        />
      ) : (
        <PostcardContent postcard={postcard} t={t} isDesktop={isDesktop} />
      )}
      <div
        {...styles.buttonWrapper}
        {...colorScheme.set(
          'boxShadow',
          !isDesktop ? 'boxShadowBottomNavBar' : undefined,
        )}
        {...colorScheme.set('backgroundColor', 'overlay')}
      >
        <div {...styles.label}>{label}</div>
        <div {...styles.buttonContainer}>
          <PostcardFilter
            subject='postcard_1'
            count={
              data['postcard_1']._state === 'LOADED'
                ? data['postcard_1'].totalCount
                : 0
            }
            imageUrl={'/static/climatelab/freier.jpg'}
            onFilterClicked={() => {
              if (
                currentPostcard === 'postcard_1' &&
                currentPostcardData._state === 'LOADED'
              ) {
                currentPostcardData.fetchNext()
              }
              setCurrentPostcard('postcard_1')
            }}
          />
          <PostcardFilter
            subject='postcard_2'
            count={
              data['postcard_2']._state === 'LOADED'
                ? data['postcard_2'].totalCount
                : 0
            }
            imageUrl={'/static/climatelab/farner.jpg'}
            onFilterClicked={() => {
              if (
                currentPostcard === 'postcard_2' &&
                currentPostcardData._state === 'LOADED'
              ) {
                currentPostcardData.fetchNext()
              }
              setCurrentPostcard('postcard_2')
            }}
          />
          <PostcardFilter
            subject='postcard_3'
            count={
              data['postcard_3']._state === 'LOADED'
                ? data['postcard_3'].totalCount
                : 0
            }
            imageUrl={'/static/climatelab/richardson.jpg'}
            onFilterClicked={() => {
              if (
                currentPostcard === 'postcard_3' &&
                currentPostcardData._state === 'LOADED'
              ) {
                currentPostcardData.fetchNext()
              }
              setCurrentPostcard('postcard_3')
            }}
          />
          <PostcardFilter
            subject='postcard_4'
            count={
              data['postcard_4']._state === 'LOADED'
                ? data['postcard_4'].totalCount
                : 0
            }
            imageUrl={'/static/climatelab/zalko.jpg'}
            onFilterClicked={() => {
              if (
                currentPostcard === 'postcard_4' &&
                currentPostcardData._state === 'LOADED'
              ) {
                currentPostcardData.fetchNext()
              }
              setCurrentPostcard('postcard_4')
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default PostcardSingleCardView

const PostcardContent = ({ postcard, t, isDesktop }) => {
  if (!postcard) {
    return <div></div>
  }

  return isDesktop ? (
    <PostcardPreview postcard={postcard} />
  ) : (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <figure {...styles.image}>
        <AssetImage width={'600'} height={'400'} src={postcard.imageUrl} />
        <figcaption
          style={{
            paddingTop: '0.25rem',
            position: 'absolute',
            fontSize: '0.75rem',
          }}
        >
          {t('Climatelab/Postcard/PostcardPreview/credit', {
            credit: postcardCredits[postcard.imageSelection] || ' ...',
          })}
        </figcaption>
      </figure>
      {postcard.text.split('\n').map(
           line => 
           <Interaction.P>{line}</Interaction.P>
       )}
      <Interaction.P>{postcard.author.name}</Interaction.P>
    </div>
  )
}
