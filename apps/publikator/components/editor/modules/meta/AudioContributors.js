import { IconButton, CloseIcon } from '@project-r/styleguide'
import { AuthorSearch } from '@project-r/styleguide/editor'

import { MetaOption } from '../../../MetaDataForm/components/Layout'
import { css } from 'glamor'

const styles = {
  pill: css({
    display: 'inline-flex',
    alignItems: 'end',
    marginRight: 20,
    backgroundColor: '#fff',
    padding: '5px 10px',
  }),
}

export default ({ contributors, onChange }) => {
  return (
    <MetaOption>
      <AuthorSearch
        label='Sprecherin suchen'
        onChange={(author) => {
          if (contributors?.find((c) => c.id === author.value.id)) return
          onChange([
            ...(contributors || []),
            {
              id: author.value.id,
              name: author.value.name,
              kind: 'voice',
            },
          ])
        }}
      />
      {contributors?.length && (
        <div>
          {contributors.map((contributor) => {
            return (
              <span key={contributor.id} {...styles.pill}>
                {contributor.name}
                <IconButton
                  Icon={CloseIcon}
                  style={{ marginLeft: 10 }}
                  size={16}
                  onClick={() => {
                    let updatedContributors = contributors.filter(
                      (c) => c.id !== contributor.id,
                    )
                    updatedContributors = updatedContributors?.length
                      ? updatedContributors
                      : null
                    onChange(updatedContributors)
                  }}
                />
              </span>
            )
          })}
        </div>
      )}
    </MetaOption>
  )
}
