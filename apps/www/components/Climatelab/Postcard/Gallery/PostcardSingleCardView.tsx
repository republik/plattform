import { useState } from 'react'

import { css, style } from 'glamor'
import {
  useColorContext,
  plainButtonRule,
  Loader,
  Interaction,
} from '@project-r/styleguide'
import AssetImage from '../../../../lib/images/AssetImage'
import { useSinglePostcardData } from './../use-postcard-data'
import PostcardFilter from './PostcardFilter'

const styles = {
  container: css({
    position: 'relative',
    margin: '0 auto',
    padding: '15px',
  }),

  image: css({
    marginBottom: '20px',
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
  // text: string
  // imageUrl: string
  // imageSelection: string
  // author: string
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

const PostcardSingleCardView: React.FC<PostcardSingleCardView> = () => {
  const [subjectFilter, setSubjectFilter] = useState()
  const singlePostcardData = useSinglePostcardData({
    highlightedPostcards: DUMMY_HIGHLIGHTED,
    subjectFilter: subjectFilter,
  })
  const onFilterClicked = (subject) => {
    setSubjectFilter(subject)
    singlePostcardData.fetchNext()
  }
  return (
    <div {...styles.container}>
      <Loader
        loading={singlePostcardData._state === 'LOADING'}
        error={singlePostcardData._state === 'ERROR'}
        render={() => {
          const { postcard } = singlePostcardData
          return (
            <>
              <div {...styles.image}>
                <AssetImage
                  width={'600'}
                  height={'400'}
                  src={postcard.imageUrl}
                />
              </div>
              <Interaction.P>{postcard.text}</Interaction.P>
            </>
          )
        }}
      />
      <br />
      <br />
      <Interaction.P>Nächste Karte lesen</Interaction.P>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          margin: '30px auto',
          justifyContent: 'space-around',
        }}
      >
        <PostcardFilter
          subject='postcard_1'
          count={1000}
          imageUrl={'/static/climatelab/freier.jpg'}
          onFilterClicked={onFilterClicked}
        />
        <PostcardFilter
          subject='postcard_2'
          count={504}
          imageUrl={'/static/climatelab/farner.jpg'}
          onFilterClicked={onFilterClicked}
        />
        <PostcardFilter
          subject='postcard_3'
          count={201}
          imageUrl={'/static/climatelab/richardson.jpg'}
          onFilterClicked={onFilterClicked}
        />
        <PostcardFilter
          subject='postcard_4'
          count={300}
          imageUrl={'/static/climatelab/zalko.jpg'}
          onFilterClicked={onFilterClicked}
        />
      </div>
    </div>
  )
}

export default PostcardSingleCardView
