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
  usePostcardCounts,
  useSinglePostcardData,
} from './../use-postcard-data'
import PostcardFilter from './PostcardFilter'
import { postcardCredits } from '../../config'
import { useTranslation } from '../../../../lib/withT'
import { PostcardPreview } from '../PostcardPreview'

const styles = {
  mobileContainer: css({
    minHeight: '100vh',
    position: 'relative',
    backgroundColor: '#F9FBFF',
    color: '#282828',
    padding: '15px',
    margin: '0 -15px',
    borderRadius: '2px',
    '& p': {
      color: '#282828',
    },
  }),
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
  imageWrapper: css({
    position: 'relative',
    margin: '0 0 40px',
  }),
  image: css({
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
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
  postcard: postcardOverride,
  isDesktop,
  highlightedPostcards,
  label,
}) => {
  const [colorScheme] = useColorContext()

  const { counts } = usePostcardCounts()

  const [currentPostcard, setCurrentPostcard] = useState<
    keyof typeof data | null
  >(postcardOverride ? null : 'postcard_1')

  const ignorePostcardId = postcardOverride?.id

  const data = {
    postcard_1: useSinglePostcardData({
      highlightedPostcards: highlightedPostcards,
      ignorePostcardId,
      subjectFilter: 'postcard_1',
    }),
    postcard_2: useSinglePostcardData({
      highlightedPostcards: highlightedPostcards,
      ignorePostcardId,
      subjectFilter: 'postcard_2',
    }),
    postcard_3: useSinglePostcardData({
      highlightedPostcards: highlightedPostcards,
      ignorePostcardId,
      subjectFilter: 'postcard_3',
    }),
    postcard_4: useSinglePostcardData({
      highlightedPostcards: highlightedPostcards,
      ignorePostcardId,
      subjectFilter: 'postcard_4',
    }),
  }

  const currentPostcardData = data[currentPostcard]

  const { t } = useTranslation()

  let loadedPostcard = null
  if (currentPostcardData?.postcard) {
    loadedPostcard = currentPostcardData.postcard
  }

  useEffect(() => {
    if (
      currentPostcardData &&
      !currentPostcardData.loading &&
      !loadedPostcard
    ) {
      console.log('empty postcard, fetching next')
      currentPostcardData.fetchNext()
    }
  }, [loadedPostcard, currentPostcardData])

  return (
    <div {...styles.container}>
      <div style={{ minHeight: isDesktop ? '40vh' : '100vh' }}>
        {currentPostcardData ? (
          <Loader
            style={{
              position: 'sticky',
              top: 0,
              height: '40vh',
            }}
            loading={currentPostcardData.loading}
            error={currentPostcardData.error}
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
          <PostcardContent
            postcard={postcardOverride}
            t={t}
            isDesktop={isDesktop}
          />
        )}
      </div>
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
            count={counts?.postcard_1}
            imageUrl={'/static/climatelab/freier.jpg'}
            onFilterClicked={() => {
              setCurrentPostcard('postcard_1')
              data['postcard_1'].fetchNext()
              return true // tell PostcardFilter that data has been fetched and the counter should be decreased
            }}
          />
          <PostcardFilter
            subject='postcard_2'
            count={counts?.postcard_2}
            imageUrl={'/static/climatelab/farner.jpg'}
            onFilterClicked={() => {
              setCurrentPostcard('postcard_2')
              data['postcard_2'].fetchNext()
              return true // tell PostcardFilter that data has been fetched and the counter should be decreased
            }}
          />
          <PostcardFilter
            subject='postcard_3'
            count={counts?.postcard_3}
            imageUrl={'/static/climatelab/richardson.jpg'}
            onFilterClicked={() => {
              data['postcard_3'].fetchNext()
              setCurrentPostcard('postcard_3')
              return true
            }}
          />
          <PostcardFilter
            subject='postcard_4'
            count={counts?.postcard_4}
            imageUrl={'/static/climatelab/zalko.jpg'}
            onFilterClicked={() => {
              setCurrentPostcard('postcard_4')
              data['postcard_4'].fetchNext()
              return true
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default PostcardSingleCardView

const PostcardContent = ({ postcard, t, isDesktop }) => {
  const [colorScheme] = useColorContext()
  if (!postcard) {
    return <div></div>
  }

  return isDesktop ? (
    <PostcardPreview
      postcard={postcard}
      {...colorScheme.set('boxShadow', 'imageChoiceShadow')}
    />
  ) : (
    <div {...styles.mobileContainer}>
      <figure {...styles.imageWrapper}>
        <AssetImage
          {...styles.image}
          width={'600'}
          height={'400'}
          src={postcard.imageUrl}
          alt='Postcard image'
        />
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
      {postcard.text.split('\n').map((line) => (
        <Interaction.P key={line}>{line}</Interaction.P>
      ))}
      <Interaction.P>
        {postcard.author &&
          postcard.author.name !== 'Unbenannt' &&
          postcard.author.anonymity === false && (
            <em>– {postcard.author.name}</em>
          )}
      </Interaction.P>
    </div>
  )
}
