import React from 'react'
import { css } from 'glamor'

import standard, * as _markers from './Markers'
import MemoTree from './MemoTree'
import IconButton from '../../../IconButton'
import { RemoveIcon } from '../../../Icons'
import { Interaction } from '../../../Typography'

export const markers = _markers

const styles = {
  tooling: css({
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 40,
  }),
}

const getMarker = (name) => {
  return markers[name] || standard
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
  const pickMarker = (name) => (e) => {
    e?.preventDefault()
    setMarker(name)
  }

  const remove = (e) => {
    e?.preventDefault()
    deleteMemo()
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
        {Object.keys(markers)
          .filter((name) => name !== 'default')
          .map((name) => {
            const { Picker } = getMarker(name)
            return (
              <Picker
                key={`marker-${name}`}
                isSelected={marker === name}
                onClick={pickMarker(name)}
              />
            )
          })}
        <div style={{ flexGrow: 1 }} />
        {!!deleteMemo && (
          <IconButton
            label={t('memo/modal/remove')}
            Icon={RemoveIcon}
            onClick={remove}
          />
        )}
      </div>
      {commitId !== 'new' ? (
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
