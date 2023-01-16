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
import { useColorContext } from '@project-r/styleguide'

const gridStyles = {
  container: css({
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 60px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gridTemplateRows: 'auto',
    gridAutoFlow: 'row dense',
    gap: '1rem',
  }),
  card: css({
    background: 'transparent',
    width: '100%',
    gridRowEnd: 'span 1',
    gridColumnEnd: 'span 1',
    cursor: 'pointer',
    transition: 'transform .3s ease-in-out',
    ':hover': {
      transform: 'scale(1.03) !important',
    },
  }),
  highlightedCard: css({
    background: 'transparent',
    width: '100%',
    // border: '2px solid pink',
    gridRowEnd: 'span 2',
    gridColumnEnd: 'span 2',
    cursor: 'pointer',
    transition: 'transform .3s ease-in-out',
    ':hover': {
      transform: 'scale(1.03) !important',
    },
  }),
  image: css({
    borderRadius: '2px',
    overflow: 'hidden',
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
  const [colorScheme] = useColorContext()

  return (
    <div {...gridStyles.container}>
      {postcards.map((p, i) => {
        const cardStyle = p.isHighlighted
          ? gridStyles.highlightedCard
          : gridStyles.card

        return (
          <div
            key={p.id}
            {...cardStyle}
            style={
              {
                // transform: `rotate(${Math.sin(i)}deg)`,
              }
            }
            onClick={() => onToggleOverlay(p)}
          >
            {p.isHighlighted ? (
              <PostcardPreview postcard={p} />
            ) : (
              <div
                {...gridStyles.image}
                {...gridStyles.imageFix}
                {...colorScheme.set('boxShadow', 'imageChoiceShadow')}
              >
                <AssetImage width='600' height='420' src={p.imageUrl} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PostcardGallery({ highlightedPostcards, label }) {
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
            <div>whoops</div>
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
            <PostcardSingleCardView
              postcard={overlayBody}
              isDesktop={isDesktop}
              highlightedPostcards={highlightedPostcards}
              label={label}
            />
          </OverlayBody>
        </Overlay>
      )}
    </>
  ) : (
    <PostcardSingleCardView
      highlightedPostcards={highlightedPostcards}
      label={label}
    />
  )
}

export default PostcardGallery
