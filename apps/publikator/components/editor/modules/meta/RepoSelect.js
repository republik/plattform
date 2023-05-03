import { css } from 'glamor'

import { IconClose } from '@republik/icons'

import { A, Label, colors } from '@project-r/styleguide'
import { RepoSearch } from '@project-r/styleguide/editor'

import { RepoLink } from '../../utils/github'

const styles = {
  value: css({
    marginBottom: 12,
    borderBottom: '1px solid #000',
    paddingRight: 20,
    position: 'relative',
  }),
  valueText: css({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 22,
    lineHeight: '40px',
  }),
  x: css({
    position: 'absolute',
    right: 0,
    bottom: 7,
  }),
}

export default ({
  label,
  template,
  isSeriesMaster,
  isSeriesEpisode,
  value,
  onChange,
}) => {
  const onRefChange = (item) => {
    onChange(
      undefined,
      item ? `https://github.com/${item.value.id}` : null,
      item,
    )
  }
  if (value) {
    return (
      <div {...styles.value}>
        {label && (
          <>
            <Label style={{ color: '#000' }}>{label}</Label>
            <br />
          </>
        )}
        <div {...styles.valueText}>
          <RepoLink
            value={value}
            invalid={(info) => (
              <span style={{ color: colors.error }}>{value}</span>
            )}
          />
        </div>
        <A
          href='#remove'
          {...styles.x}
          onClick={(e) => {
            e.preventDefault()
            onRefChange(null)
          }}
        >
          <IconClose size={25} />
        </A>
      </div>
    )
  }

  return (
    <RepoSearch
      label={label}
      template={template}
      isSeriesMaster={isSeriesMaster}
      isSeriesEpisode={isSeriesEpisode}
      onChange={onRefChange}
    />
  )
}
