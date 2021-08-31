import React from 'react'
import Center from './Center'
import { fontFamilies, fontStyles } from '../../../../theme/fonts'
import colors from '../../../../theme/colors'
import { getFormatLine } from '../../../../components/TeaserFeed/utils'

export const TitleBlock = ({
  children,
  center,
  format,
  series,
  repoId,
  path
}) => {
  const formatLine = getFormatLine({
    format,
    series,
    repoId,
    path
  })

  return (
    <Center>
      <section
        className='title-block'
        style={{
          textAlign: center ? 'center' : null
        }}
      >
        {formatLine.title && (
          <p
            style={{
              fontFamily: fontFamilies.sansSerifMedium,
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '24px',
              color: formatLine.color,
              margin: '0px 0px 28px'
            }}
          >
            {formatLine.title}
          </p>
        )}
        {children}
      </section>
    </Center>
  )
}

export const Headline = ({ children, attributes, ...props }) => (
  <h1
    style={{
      ...fontStyles.serifTitle,
      fontSize: '30px',
      lineHeight: '34px',
      margin: '0px 0px 12px'
    }}
    {...attributes}
    {...props}
  >
    {children}
  </h1>
)

export const Subject = ({ children, attributes, ...props }) => (
  <h2
    style={{
      color: '#8c8c8c',
      display: 'inline',
      ...fontStyles.sansSerifRegular,
      fontSize: '23px',
      lineHeight: '37px',
      paddingRight: '4px'
    }}
    {...attributes}
    {...props}
  >
    {children}
  </h2>
)

export const Lead = ({ children, attributes, ...props }) => (
  <p
    style={{
      color: colors.text,
      ...fontStyles.serifRegular,
      fontSize: '23px',
      lineHeight: '30px',
      display: 'inline',
      margin: '0 0 20px 0'
    }}
    {...attributes}
    {...props}
  >
    {children}
  </p>
)

export const Credits = ({ children, attributes, ...props }) => (
  <p
    style={{
      color: colors.text,
      ...fontStyles.sansSerifRegular,
      fontSize: '15px',
      lineHeight: '21px'
    }}
    {...attributes}
    {...props}
  >
    {children}
  </p>
)
