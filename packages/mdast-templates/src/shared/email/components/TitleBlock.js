import React from 'react'
import Center from './Center'
import { fontStyles } from '@project-r/styleguide/src/theme/fonts'
import colors from '@project-r/styleguide/src/theme/colors'
import { getFormatLine } from '@project-r/styleguide/src/components/TeaserFeed/utils'

export const TitleBlock = ({
  children,
  center,
  format,
  series,
  repoId,
  path,
}) => {
  const formatLine = getFormatLine({
    format,
    series,
    repoId,
    path,
  })

  return (
    <Center>
      <section
        className='title-block'
        style={{
          textAlign: center ? 'center' : null,
        }}
      >
        {formatLine.title && (
          <Format color={formatLine.color} href={formatLine.path}>
            {formatLine.title}
          </Format>
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
      margin: '0px 0px 12px',
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
      paddingRight: '4px',
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
      margin: '0 0 20px 0',
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
      lineHeight: '21px',
    }}
    {...attributes}
    {...props}
  >
    {children}
  </p>
)

const Format = ({ children, color, href }) => (
  <p
    style={{
      ...fontStyles.sansSerifMedium,
      fontSize: '20px',
      fontStyles: '24px',
      margin: '0 0 28px 0',
      color,
    }}
  >
    {children}
  </p>
)
