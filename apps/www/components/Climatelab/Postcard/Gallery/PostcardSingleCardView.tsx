import { useState } from 'react'

import { css, style } from 'glamor'
import {
  useColorContext,
  plainButtonRule,
  Loader,
  Interaction,
} from '@project-r/styleguide'
import AssetImage from '../../../../lib/images/AssetImage'
import { Postcard, useSinglePostcardData } from './../use-postcard-data'
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
  buttonContainer: css({
    position: 'sticky',
    backgroundColor: 'white',
    zIndex: 30,
    bottom: 0,
    display: 'flex',
    flexWrap: 'wrap',
    padding: '20px 0',
    margin: '10px auto',
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
}

type PostcardSingleCardView = {
  postcard?: Postcard
  isDesktop?: boolean
}

const DUMMY_HIGHLIGHTED = [
  {
    id: '8178e062-0569-47f6-a136-625f07e63678',
    text: 'This is the new text!',
  },
  {
    id: '67177a2c-04df-4e70-8fd7-f1e5dc4116f9',
    text: 'This is the new text again!',
  },
]

const PostcardSingleCardView: React.FC<PostcardSingleCardView> = ({
  postcard,
  isDesktop,
}) => {
  const data = {
    postcard_1: useSinglePostcardData({
      highlightedPostcards: DUMMY_HIGHLIGHTED,
      subjectFilter: 'postcard_1',
    }),
    postcard_2: useSinglePostcardData({
      highlightedPostcards: DUMMY_HIGHLIGHTED,
      subjectFilter: 'postcard_2',
    }),
    postcard_3: useSinglePostcardData({
      highlightedPostcards: DUMMY_HIGHLIGHTED,
      subjectFilter: 'postcard_3',
    }),
    postcard_4: useSinglePostcardData({
      highlightedPostcards: DUMMY_HIGHLIGHTED,
      subjectFilter: 'postcard_4',
    }),
  }

  const [currentPostcard, setCurrentPostcard] = useState<
    keyof typeof data | null
  >(postcard ? null : 'postcard_1')

  const currentPostcardData = data[currentPostcard]

  const { t } = useTranslation()

  return (
    <div {...styles.container}>
      <Interaction.P>Nächste Karte lesen</Interaction.P>
      {currentPostcardData ? (
        <Loader
          loading={currentPostcardData._state === 'LOADING'}
          error={currentPostcardData._state === 'ERROR'}
          render={() => {
            if (currentPostcardData._state !== 'LOADED') {
              return
            }
            const { postcard } = currentPostcardData
            return (
              <PostcardContent
                postcard={postcard}
                t={t}
                isDesktop={isDesktop}
              />
            )
          }}
        />
      ) : (
        <PostcardContent postcard={postcard} t={t} isDesktop={isDesktop} />
      )}

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
  )
}

export default PostcardSingleCardView

const PostcardContent = ({ postcard, t, isDesktop }) => {
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
      <Interaction.P>{postcard.text}</Interaction.P>
      <Interaction.P>{postcard.author.name}</Interaction.P>
    </div>
  )
}
