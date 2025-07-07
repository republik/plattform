import { IconButton, Interaction, markerKeys } from '@project-r/styleguide'
import { IconRemove } from '@republik/icons'
import { css } from 'glamor'
import MemoTree from './MemoTree'

import { Picker } from './Picker'

const styles = {
  tooling: css({
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 40,
  }),
}

const MemoForm = ({
  t,
  repoId,
  commitId,
  parentId,
  setParentId,
  marker,
  setMarker,
  deleteMemo,
  MarkedSection,
}) => {
  const pickMarker = (name) => () => {
    setMarker(name)
  }

  const onPublished = (memo) => {
    const isRoot = !memo.parentIds.length
    if (isRoot) {
      setParentId(memo.id)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>{MarkedSection}</div>
      <div {...styles.tooling}>
        {markerKeys.map((color) => {
          return (
            <Picker
              key={`marker-${color}`}
              marker={color}
              isSelected={marker === color}
              onClick={pickMarker(color)}
            />
          )
        })}
        <div style={{ flexGrow: 1 }} />
        {!!deleteMemo && (
          <IconButton
            label={t('memo/modal/remove')}
            Icon={IconRemove}
            onClick={deleteMemo}
          />
        )}
      </div>
      {!!commitId && commitId !== 'new' ? (
        <MemoTree
          t={t}
          repoId={repoId}
          parentId={parentId}
          onPublished={onPublished}
        />
      ) : (
        <Interaction.P>{t('memo/modal/warning/newDoc')}</Interaction.P>
      )}
    </>
  )
}

export default MemoForm
