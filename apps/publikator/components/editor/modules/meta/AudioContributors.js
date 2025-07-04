import { AuthorSearch, IconButton } from '@project-r/styleguide'
import { IconClose } from '@republik/icons'
import { css } from 'glamor'

import { MetaOption } from '../../../MetaDataForm/components/Layout'

const styles = {
  pill: css({
    display: 'inline-flex',
    alignItems: 'end',
    margin: '10px 10px 0 0',
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
          if (contributors?.find((c) => c.userId === author.value.id)) return
          onChange([
            ...(contributors || []),
            {
              userId: author.value.id,
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
              <span key={contributor.userId} {...styles.pill}>
                {contributor.name}
                <IconButton
                  Icon={IconClose}
                  style={{ marginLeft: 10 }}
                  size={16}
                  onClick={() => {
                    let updatedContributors = contributors.filter(
                      (c) => c.userId !== contributor.userId,
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
