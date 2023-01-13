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

const HIGHLIGHTS_DUMMY = [
  {
    id: '8178e062-0569-47f6-a136-625f07e63678',
    text: 'Haltet durch! Die Welt ist träge, der Wachstumsdruck tiefst verwurzelt. Haltet durch! Forscht, versucht, verbreitet Beispiele, überzeugt. Ihr seid viele, überall in alle Positionen. Macht weiter! Die einfach Lösungen funktionieren bald nicht mehr.  Dass ihr diese Karte lest, beweist, dass ein Wandel dieser Welt möglich war. ',
  },
  {
    id: 'c10b328a-4dc0-4775-a455-529ebbed4577',
    text: 'Grüsse aus dem mediterranen Zürich',
  },
  {
    id: 'a3dd4d32-e93e-4d03-8eaa-7ddba42abc7b',
    text: 'Gerade noch konnten wir den einen oder anderen Hebel in Bewegung setzen, um die Welt zu einem, für unsere Enkel, inspirierenden und wunderbaren, lebenswerten Ort beizubehalten. Hach und zu Hause ist es einfach am schönsten! Denn das gute liegt so nah.. toll, können wir Arbeiten, was wir lieben und wo wir es am liebsten tun. \nHebed eus Sorg!',
  },
  {
    id: '67177a2c-04df-4e70-8fd7-f1e5dc4116f9',
    text: 'Wir schreiben das Jahr 2083 und blicken positiv in die Zukunft. Nach den heftigen Ressourcenkriegsjahren der 40er und den verheerenden Durren der 50er sah die Menschheit endlich ein, dass Änderungen nötig waren. Zumindest in unseren Breitengraden. Abgesehen von den Hotlands, wo Menschen nicht mehr leben können, ist die Welt lokaler und sozialer geworden. Mit viel weniger Menschen lebt man hierzulande ohne Krieg und Ausbeutung im Einklang mit der Natur, zirkular, fossilfrei und regenerativ.',
  },
]

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

function PostcardGallery(props) {
  console.log(props)
  const [subjectFilter, setSubjectFilter] = useState()
  const postcardsData = usePostcardsData({
    highlightedPostcards: HIGHLIGHTS_DUMMY,
    subjectFilter: subjectFilter,
  })
  // const postcardsData = useMockPostcardsData()

  const isDesktop = useMediaQuery(mediaQueries.mUp)

  const [toggleOverlay, setToggleOverlay] = useState({
    isOpen: false,
  })
  const [overlayBody, setOverlayBody] = useState(null)

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
