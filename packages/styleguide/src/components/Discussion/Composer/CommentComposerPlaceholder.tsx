import React, { useMemo } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { css } from 'glamor'
import { serifRegular16 } from '../../Typography/styles'
import { convertStyleToRem, pxToRem } from '../../Typography/utils'
import { useColorContext } from '../../Colors/ColorContext'

const styles = {
  root: css({
    ...convertStyleToRem(serifRegular16),
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    height: pxToRem('56px'),
    cursor: 'pointer',
  }),
  profilePicture: css({
    display: 'block',
    width: pxToRem('40px'),
    height: pxToRem('40px'),
    marginRight: '8px',
  }),
  meta: css({
    flex: 1,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  }),
}

const propTypes = {
  t: PropTypes.func.isRequired,
  displayAuthor: PropTypes.shape({
    profilePicture: PropTypes.string,
  }),
  onClick: PropTypes.func,
  placeholder: PropTypes.string,
}

export const CommentComposerPlaceholder = ({
  t,
  displayAuthor,
  onClick,
  placeholder,
}: InferProps<typeof propTypes>) => {
  const [colorScheme] = useColorContext()
  const rootHover = useMemo(
    () =>
      css({
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('text'),
          },
        },
      }),
    [colorScheme],
  )
  return (
    <div
      {...styles.root}
      {...colorScheme.set('background', 'hover')}
      {...colorScheme.set('color', 'textSoft')}
      {...rootHover}
      onClick={onClick}
    >
      {displayAuthor.profilePicture && (
        <img
          {...styles.profilePicture}
          src={displayAuthor.profilePicture}
          alt=''
        />
      )}
      <div {...styles.meta}>
        {placeholder ?? t('styleguide/CommentComposer/placeholder')}
      </div>
    </div>
  )
}

CommentComposerPlaceholder.propTypes = propTypes
