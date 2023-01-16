import AssetImage from '../../../../lib/images/AssetImage'

import { css } from 'glamor'
import { useState } from 'react'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Loader,
  useMediaQuery,
  mediaQueries,
} from '@project-r/styleguide'

import { PostcardPreview } from '../PostcardPreview'
import { Postcard, usePostcardsData } from '../use-postcard-data'
import PostcardSingleCardView from './PostcardSingleCardView'

const gridStyles = {
  container: css({
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 60px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gridTemplateRows: 'auto',
    gridAutoFlow: 'row dense',
    gap: '1rem',
  }),
  card: css({
    background: 'hotpink',
    width: '100%',
    gridRowEnd: 'span 1',
    gridColumnEnd: 'span 1',
    cursor: 'pointer',
    transition: 'transform .3s ease-in-out',
    ':hover': {
      transform: 'rotate(0deg) !important',
    },
  }),
  highlightedCard: css({
    background: 'hotpink',
    width: '100%',
    // border: '2px solid pink',
    gridRowEnd: 'span 3',
    gridColumnEnd: 'span 3',
    cursor: 'pointer',
    transition: 'transform .3s ease-in-out',
    ':hover': {
      transform: 'rotate(0deg) !important',
    },
  }),
  imageFix: css({
    '> span': { display: 'block !important' },
  }),
}

const PostcardsGrid = ({
  postcards,
  onToggleOverlay,
}: {
  postcards: Postcard[]
  onToggleOverlay: (a?: object) => void
}) => {
  return (
    <div {...gridStyles.container}>
      {postcards.map((p) => {
        const cardStyle = p.isHighlighted
          ? gridStyles.highlightedCard
          : gridStyles.card

        return (
          <div key={p.id} {...cardStyle} onClick={() => onToggleOverlay(p)}>
            {p.isHighlighted ? (
              <PostcardPreview postcard={p} />
            ) : (
              <div {...gridStyles.imageFix}>
                <AssetImage width='600' height='420' src={p.imageUrl} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PostcardGallery({ highlightedPostcards }) {
  const [subjectFilter] = useState()
  const postcardsData = usePostcardsData({
    highlightedPostcards: highlightedPostcards,
    subjectFilter: subjectFilter,
  })
  // const postcardsData = useMockPostcardsData()

  const isDesktop = useMediaQuery(mediaQueries.mUp)

  const [toggleOverlay, setToggleOverlay] = useState({
    isOpen: false,
  })
  const [overlayBody, setOverlayBody] = useState(null)

  const onOverlayToggeled = (content) => {
    setToggleOverlay({ isOpen: toggleOverlay.isOpen ? false : true })
    setOverlayBody(content)
  }

  return isDesktop ? (
    <>
      <Loader
        loading={postcardsData._state === 'LOADING'}
        error={postcardsData._state === 'ERROR'}
        render={() =>
          postcardsData._state === 'LOADED' ? (
            <PostcardsGrid
              postcards={postcardsData.postcards}
              onToggleOverlay={onOverlayToggeled}
            />
          ) : (
            <div>whoosp</div>
          )
        }
      />
      {toggleOverlay.isOpen && (
        <Overlay
          onClose={() => {
            setToggleOverlay({ isOpen: false })
          }}
        >
          <OverlayToolbar
            onClose={() => {
              setToggleOverlay({ isOpen: false })
            }}
          />
          <OverlayBody>
            <PostcardSingleCardView postcard={overlayBody} />
          </OverlayBody>
        </Overlay>
      )}
    </>
  ) : (
    <PostcardSingleCardView />
  )
}

export default PostcardGallery
