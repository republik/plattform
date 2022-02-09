import React from 'react'
import { css } from 'glamor'
import {
  fontFamilies,
  fontStyles,
  Interaction,
  mediaQueries,
  RawHtml,
  useColorContext,
} from '@project-r/styleguide'
import withInNativeApp from '../../lib/withInNativeApp'

const { Headline } = Interaction

export const sharedStyles = {
  hint: css({
    marginTop: 10,
  }),
  buttons: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 15,
    [mediaQueries.onlyS]: {
      '& button': {
        minWidth: 0,
      },
    },
  }),
  card: css({
    padding: 10,
    outlineWidth: 1,
    outlineStyle: 'solid',
  }),
  narrowCard: css({
    padding: 10,
  }),
}

export const Section = ({ children }) => (
  <section
    {...css({
      marginTop: 30,
    })}
  >
    {children}
  </section>
)

export const Title = ({ children }) => (
  <Headline
    {...css({
      marginBottom: 35,
    })}
  >
    {children}
  </Headline>
)

export const Strong = ({ children }) => (
  <strong
    {...css({
      fontFamily: fontFamilies.sansSerifMedium,
      fontWeight: 'normal',
    })}
  >
    {children}
  </strong>
)

const PMedium = (props) => (
  <div
    {...css({
      ...fontStyles.sansSerifRegular16,
      marginBottom: 15,
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifRegular21,
      },
      '& strong': {
        fontFamily: fontFamilies.sansSerifMedium,
        fontWeight: 'normal',
      },
      '& ul': {
        paddingLeft: 25,
      },
    })}
  >
    {props.children}
  </div>
)

export const Body = withInNativeApp(({ dangerousHTML, inNativeApp }) => {
  const html = inNativeApp
    ? dangerousHTML.replace(/'/g, '"').replace(/target="_blank"/g, '')
    : dangerousHTML
  return (
    <div>
      {html.split('\n\n').map((c, i) => (
        <PMedium key={i}>
          <RawHtml dangerouslySetInnerHTML={{ __html: c }} />
        </PMedium>
      ))}
    </div>
  )
})

const PSmall = ({ children, indent = true }) => (
  <div
    {...css({
      marginTop: 10,
      marginLeft: indent ? 20 : 0,
      ...fontStyles.sansSerifRegular16,
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifRegular16,
        lineHeight: 1.4,
      },
      '& strong': {
        fontFamily: fontFamilies.sansSerifMedium,
        fontWeight: 'normal',
      },
    })}
  >
    {children}
  </div>
)

export const Small = withInNativeApp(
  ({ dangerousHTML, inNativeApp, indent = true }) => {
    const html = inNativeApp
      ? dangerousHTML.replace(/'/g, '"').replace(/target="_blank"/g, '')
      : dangerousHTML
    return (
      <div>
        {html.split('\n\n').map((c, i) => (
          <PSmall key={i} indent={indent}>
            <RawHtml dangerouslySetInnerHTML={{ __html: c }} />
          </PSmall>
        ))}
      </div>
    )
  },
)

export const Card = ({ children, style }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...sharedStyles.card}
      style={style}
      {...colorScheme.set('backgroundColor', 'alert')}
      {...colorScheme.set('outlineColor', 'default')}
    >
      {children}
    </div>
  )
}

export const NarrowCard = ({ children }) => (
  <Card style={{ margin: '40px auto', maxWidth: 550 }}>
    <div {...sharedStyles.narrowCard}>{children}</div>
  </Card>
)
