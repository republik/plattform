import { motion, useScroll, Variant } from 'framer-motion'
import { ReactNode, useRef, useState, useEffect } from 'react'

import { css } from 'glamor'
import {
  Center,
  Editorial,
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
  useColorContext,
  useHeaderHeight,
  fontStyles,
} from '@project-r/styleguide'
import Frame from '../Frame'

// GENERIC-Y STUFF

const RADIUS = 15
const PADDING_TOP = 250
const PADDING_LEFT = -100
const CIRCLE_PADDING = 5
const COLUMNS = 10
const SIZE = RADIUS + CIRCLE_PADDING

const dataSet = [...Array(100)].map((d, i) => {
  const colIndex = i % COLUMNS
  const rowIndex = Math.floor(i / COLUMNS)
  return {
    cx: colIndex * SIZE + RADIUS,
    cy: rowIndex * SIZE,
    r: RADIUS,
    delay: i * 5,
    id: i,
  }
})

const ChapterIndicator = ({
  highlighted,
  mini,
  children,
}: {
  highlighted?: boolean
  mini?: boolean
  children: ReactNode
}) => {
  const [colorScheme] = useColorContext()
  return (
    <span
      {...styles.chapterIndicator}
      {...(mini && styles.chapterIndicatorMini)}
      {...(highlighted
        ? colorScheme.set('background-color', 'textSoft')
        : colorScheme.set('background-color', 'hover'))}
      {...(highlighted
        ? colorScheme.set('color', 'default')
        : colorScheme.set('color', 'text'))}
    >
      {children}
    </span>
  )
}

const ScrollySlide = ({
  children,
  highlighted,
  onChangeInView,
}: {
  children: ReactNode
  highlighted?: boolean
  onChangeInView: (inView: boolean) => void
}) => {
  const ref = useRef(null)
  // const isInView = useInView(ref, { amount: 0.5, margin: '-30% 0px 0px 0px' }) // FIXME margin top should be correct bottom of graphic
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 40vh'],
  })

  useEffect(() => {
    const doSomething = (value) => {
      if (value >= 1) {
        onChangeInView(true)
      } else {
        onChangeInView(false)
      }
    }

    const unsubY = scrollYProgress.onChange(doSomething)

    return () => {
      unsubY()
    }
  }, [scrollYProgress])

  return (
    <section
      ref={ref}
      {...styles.scrollySlide}
      style={{ opacity: highlighted ? 1 : 0.5 }}
    >
      {children}
    </section>
  )
}

// CONTENT-Y STUFF

type StoryVariant = 'step0' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5'
const variantKeys: StoryVariant[] = [
  'step0',
  'step1',
  'step2',
  'step3',
  'step4',
  'step5',
]
const defineVariants = (
  defaultVariant: Variant,
  variants: Partial<Record<StoryVariant, Variant>>,
) => {
  const v: Partial<Record<StoryVariant, Variant>> = {}
  for (const k of variantKeys) {
    v[k] = variants[k] ?? defaultVariant
  }
  return v
}
const getVariant = (highlighted: number) => {
  switch (highlighted) {
    case 0:
      return 'step1'
    case 1:
      return 'step2'
    case 2:
      return 'step3'
    case 3:
      return 'step4'
    case 4:
      return 'step5'
  }
  return 'step0'
}

const StoryGraphic = ({ highlighted }: { highlighted: number }) => {
  const [colorScheme] = useColorContext()
  return (
    <motion.svg
      viewBox='0 0 750 563'
      preserveAspectRatio='xMidYMid meet'
      style={{ width: '100%', height: '100%' }}
      {...colorScheme.set('background-color', 'default')}
      // width='750'
      // height='563'
      initial='step0'
      animate={getVariant(highlighted)}
    >
      {/* <defs>
        <marker
          id='arrowhead'
          viewBox='0 0 10 10'
          refX='3'
          refY='5'
          markerWidth='6'
          markerHeight='6'
          orient='auto'
        >
          <path d='M 0 0 L 10 5 L 0 10 z' style={{ fill: 'currentcolor' }} />
        </marker>
      </defs> */}

      {/* first age group, below 29 */}
      <g transform={`translate(${PADDING_LEFT}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.rect
              key={`ref-${d}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  opacity: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 42 ? '#737373' : '#30A5A3',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 63 ? '#737373' : '#30A5A3',
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 73 ? '#737373' : '#30A5A3',
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 78 ? '#737373' : '#30A5A3',
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 83 ? '#737373' : '#30A5A3',
                  },
                },
              )}
            ></motion.rect>
          )
        })}

        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 20, y: 225, opacity: 0 },
            {
              step1: {
                x: 20,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step3: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step4: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step5: {
                x: 20,
                y: 225,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          unter 30 Jahren
        </motion.text>
      </g>

      {/* second age group, 30 to 34 */}
      <g transform={`translate(${135}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.rect
              key={`ref-${d}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  opacity: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 40 ? '#737373' : '#b481d3',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 61 ? '#737373' : '#b481d3',
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 72 ? '#737373' : '#b481d3',
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 77 ? '#737373' : '#b481d3',
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 82 ? '#737373' : '#b481d3',
                  },
                },
              )}
            ></motion.rect>
          )
        })}

        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 20, y: 225, opacity: 0 },
            {
              step1: {
                x: 20,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step3: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step4: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step5: {
                x: 20,
                y: 225,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          30–34 Jahre
        </motion.text>
      </g>

      {/* third age group, 35 to 39 */}
      <g transform={`translate(${370}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.rect
              key={`ref-${d}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  opacity: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 33 ? '#737373' : '#c08c44',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 50 ? '#737373' : '#c08c44',
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 59 ? '#737373' : '#c08c44',
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 64 ? '#737373' : '#c08c44',
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 68 ? '#737373' : '#c08c44',
                  },
                },
              )}
            ></motion.rect>
          )
        })}
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 20, y: 225, opacity: 0 },
            {
              step1: {
                x: 20,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step3: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step4: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step5: {
                x: 20,
                y: 225,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          35–39 Jahre
        </motion.text>
      </g>

      {/* fourth age group, greater than 40 */}
      <g transform={`translate(${605}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.rect
              key={`ref-${d}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  opacity: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 18 ? '#737373' : '#aa3700',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 27 ? '#737373' : '#aa3700',
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 31 ? '#737373' : '#aa3700',
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 33 ? '#737373' : '#aa3700',
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    width: d.r,
                    height: d.r,
                    opacity: 1,
                    fill: i >= 36 ? '#737373' : '#aa3700',
                  },
                },
              )}
            ></motion.rect>
          )
        })}

        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 20, y: 225, opacity: 0 },
            {
              step1: {
                x: 20,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step3: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step4: {
                x: 20,
                y: 225,
                opacity: 1,
              },
              step5: {
                x: 20,
                y: 225,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          über 40 Jahre
        </motion.text>
      </g>
    </motion.svg>
  )
}

const Scrolly = () => {
  const [colorScheme] = useColorContext()
  const [inViewList, setInViewList] = useState([
    false,
    false,
    false,
    false,
    false,
  ])

  const handleInView = (idx: number) => (inView: boolean) => {
    setInViewList((v1) => {
      const v2 = [...v1]
      v2[idx] = inView
      return v2
    })
  }

  const lastInView = inViewList.lastIndexOf(true)

  return (
    <div className='Scrolly' {...styles.scrolly}>
      <div {...styles.scrollyGraphicsContainer}>
        <div
          {...styles.scrollyGraphicsChapters}
          {...colorScheme.set('background-color', 'default')}
        >
          <div style={{ width: '100%' }}>
            <ChapterIndicator mini highlighted={lastInView === 0}>
              1
            </ChapterIndicator>
            <ChapterIndicator mini highlighted={lastInView === 1}>
              2
            </ChapterIndicator>
            <ChapterIndicator mini highlighted={lastInView === 2}>
              3
            </ChapterIndicator>
            <ChapterIndicator mini highlighted={lastInView === 3}>
              4
            </ChapterIndicator>
            <ChapterIndicator mini highlighted={lastInView === 4}>
              5
            </ChapterIndicator>
          </div>
        </div>

        <StoryGraphic highlighted={lastInView} />
      </div>

      <ScrollySlide
        highlighted={lastInView === 0}
        onChangeInView={handleInView(0)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 0}>1</ChapterIndicator>
          Der Anfang
        </Editorial.Subhead>
        <Editorial.P>
          Viele denken, dass In-Vitro-Fertilisation ein sicherer Weg ist, um
          auch mit über 40 noch schwanger zu werden. Das stimmt in begrenztem
          Masse. Tatsächlich zeigt die Statistik: Jenseits der 40 wird es auch
          mit IVF deutlich weniger wahrscheinlich, überhaupt schwanger zu
          werden.
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 1}
        onChangeInView={handleInView(1)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 1}>2</ChapterIndicator>
          Januar 2022
        </Editorial.Subhead>
        <Editorial.P>Gleicher Ort, gleiche Zeit. Ein Jahr vorher.</Editorial.P>

        <Editorial.P>Die 2000mm wirken ein bisschen dürftig.</Editorial.P>

        <Editorial.P>
          War nun der Januar 2023 aussergewöhnlich trocken oder der Januar 2022
          übermässig nass?
        </Editorial.P>

        <Editorial.P>
          Was wäre nun, wenn eine Meteorologin sagen würde: «Der Januar 2022 war
          ebenfalls ziemlich trocken.»
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 2}
        onChangeInView={handleInView(2)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 2}>3</ChapterIndicator>
          Referenzperiode
        </Editorial.Subhead>
        <Editorial.P>
          Die geringe Niederschlagsmenge im Januar 2023 ist nicht einfach eine
          statistische Anomalie, sondern Teil eines grösseren Trends.
        </Editorial.P>

        <Editorial.P>Die Schweizer Winter werden immer trockener.</Editorial.P>

        <Editorial.P>
          Vergleicht man die Referenzperiode von 1931 bis 1960 mit der aktuellen
          Referenzperiode, zeigt sich deutlich, dass unsere Eltern noch mehr
          Schnee gesehen haben als unsere Kinder heute.
        </Editorial.P>

        <Editorial.P>
          Und es geht um mehr als die Kindheits-erinnerungen an ein
          Winterwunderland.{' '}
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 3}
        onChangeInView={handleInView(3)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 3}>4</ChapterIndicator>
          Gletscher
        </Editorial.Subhead>
        <Editorial.P>
          «Wir haben mehr als die Hälfte des Winters hinter uns, und die
          Schneedecke auf den Schweizer Gletschern ist immer noch stark
          unterdurchschnittlich», sagt der Glaziologe Matthias Huss.
        </Editorial.P>

        <Editorial.P>
          Eine Analyse der bisherigen Daten zur Schneedecke zeigt: Das Jahr 2023
          kommt dem Extrem vom letzten Jahr erschreckend nahe.
        </Editorial.P>

        <Editorial.P>
          Obwohl die Daten noch nicht vollständig vorhanden sind, ist für Huss
          klar: «Die extreme Winterdürre betrifft alle Regionen der Schweiz.»
        </Editorial.P>
      </ScrollySlide>
      <ScrollySlide
        highlighted={lastInView === 4}
        onChangeInView={handleInView(4)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 4}>5</ChapterIndicator>
          Mehr als 4 Transfers
        </Editorial.Subhead>
        <Editorial.P>
          «Wir haben mehr als die Hälfte des Winters hinter uns, und die
          Schneedecke auf den Schweizer Gletschern ist immer noch stark
          unterdurchschnittlich», sagt der Glaziologe Matthias Huss.
        </Editorial.P>

        <Editorial.P>
          Eine Analyse der bisherigen Daten zur Schneedecke zeigt: Das Jahr 2023
          kommt dem Extrem vom letzten Jahr erschreckend nahe.
        </Editorial.P>

        <Editorial.P>
          Obwohl die Daten noch nicht vollständig vorhanden sind, ist für Huss
          klar: «Die extreme Winterdürre betrifft alle Regionen der Schweiz.»
        </Editorial.P>
      </ScrollySlide>
    </div>
  )
}

const DotApp = () => {
  return (
    <Frame>
      <Center>
        <div>
          <Editorial.Headline>
            Die Wirksamkeit von IVF wird überschätzt
          </Editorial.Headline>
          <Editorial.Lead>
            Die Schule ist aus, die Winterferien beginnen. Nur: Wo bleibt der
            Schnee. Eine Einordnung in vier Schritten.
          </Editorial.Lead>
          <p className='byline'>
            Von Karen Merkel und Felix Michel, 23.03.2023
          </p>
        </div>
        <Scrolly />
        <section className='content' style={{ minHeight: '100vh' }}>
          <InfoBox>
            <InfoBoxTitle>Zu den Daten</InfoBoxTitle>

            <InfoBoxText>
              Die Daten zu den Niederschlägen stammen von Meteoschweiz. Für die
              Referenzperioden wurden die Durchschnittswerte berechnet. Die
              Daten zum Gletscher Plaine Morte wurden von Matthias Huss
              aufbereitet und der Republik zur Verfügung gestellt.
            </InfoBoxText>
          </InfoBox>
        </section>
      </Center>
    </Frame>
  )
}

export default DotApp

const styles = {
  scrolly: css({
    position: 'relative',
  }),
  scrollySlide: css({
    transition: 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)',
    maxWidth: '43rem',
    margin: '0 auto',
  }),
  scrollyGraphicsContainer: css({
    position: 'sticky',
    top: 0,
    /* min-height: 50dvh; */
    width: '100%',
    zIndex: 1,
    display: 'flex',
    height: '50vw',
    maxHeight:
      '30vh' /* don't use dvh here, otherwise the layout will jump when scrolling */,
    backdropFilter: 'blur(2px)',
    flexWrap: 'wrap',
    marginBottom: 100,
  }),
  scrollyGraphicsChapters: css({
    width: '100%',
    textAlign: 'center',
    paddingTop: 20,
  }),
  chapterIndicatorMini: css({
    width: '1.3rem',
    height: '1.3rem',
    lineHeight: '1.3em',
    fontSize: '0.875rem',
    marginRight: '0.25rem',
  }),
  chapterIndicator: css({
    transition: 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)',
    fontSize: '1rem',
    display: 'inline-flex',
    justifyContent: 'center',
    verticalAlign: 'middle',
    width: '1.675em',
    height: '1.675em',
    lineHeight: '1.675em',
    borderRadius: '0.2rem',
    marginRight: '0.5rem',
    marginTop: '-0.3rem',
  }),
  label: css({
    ...fontStyles.sansSerifRegular23,
  }),
}
