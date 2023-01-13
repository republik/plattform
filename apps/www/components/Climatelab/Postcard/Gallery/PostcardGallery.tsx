import AssetImage from '../../../../lib/images/AssetImage'
import { useTranslation } from '../../../../lib/withT'

import { css } from 'glamor'
import { useState } from 'react'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Button,
  Loader,
  Center,
  useMediaQuery,
  mediaQueries,
} from '@project-r/styleguide'

import { PostcardPreview } from '../PostcardPreview'
import { Postcard, usePostcardsData } from '../use-postcard-data'
import PostcardFilter from './PostcardFilter'
import PostcardSingleCardView from './PostcardSingleCardView'

// deprecated?
// type ImageSrcData = {
//   src: string
//   dark: null
//   srcSet: string
//   maxWidth: number
//   size: { width: number; height: number }
// }

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
  }),
  highlightedCard: css({
    background: 'hotpink',
    width: '100%',
    // border: '2px solid pink',
    gridRowEnd: 'span 3',
    gridColumnEnd: 'span 3',
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

function PostcardGallery() {
  const [subjectFilter, setSubjectFilter] = useState()
  const postcardsData = usePostcardsData({
    highlightedPostcards: [],
    subjectFilter: subjectFilter,
  })
  // const postcardsData = useMockPostcardsData()

  const isDesktop = useMediaQuery(mediaQueries.mUp)

  const [toggleOverlay, setToggleOverlay] = useState({ isOpen: false })
  const [overlayBody, setOverlayBody] = useState({})

  const onFilterClicked = (subject) => {
    setSubjectFilter(subject)
  }

  const onOverlayToggeled = (content) => {
    setToggleOverlay({ isOpen: toggleOverlay.isOpen ? false : true })
    setOverlayBody(content)
  }

  // rough function to try out the pattern with a button loading a random new card
  // const loadAnotherCard = (id) => {
  //   const randomNumber = Math.floor(Math.random() * (49 - 1 + 1) + 1)
  //   console.log(randomNumber)
  //   const newCard = postcardsData.postcards.filter((d) => d.id !== id)[
  //     randomNumber
  //   ]
  //   setOverlayBody(newCard)
  // }

  return isDesktop ? (
    <>
      <Loader
        loading={postcardsData._state === 'LOADING'}
        error={postcardsData._state === 'ERROR'}
        render={() => (
          <PostcardsGrid
            postcards={postcardsData.postcards}
            onToggleOverlay={onOverlayToggeled}
          />
        )}
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
