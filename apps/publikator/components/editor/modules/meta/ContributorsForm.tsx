import { useState } from 'react'
import {
  MetaSection,
  MetaSectionTitle,
} from '../../../MetaDataForm/components/Layout'
import withT from '../../../../lib/withT'
import {
  Button,
  Field,
  Dropdown,
  Checkbox,
  Interaction,
  IconButton,
  Label,
} from '@project-r/styleguide'
import { IconClose } from '@republik/icons'

// unfortunately, "contributors" is already used for speakers processing
const CONTRIBUTORS_KEY = 'bylineContributors'

// NOTE: ultimately, the author will be an id referencing a backend or DatoCms entry
type Contributor = {
  author: string
  role: string
  main?: boolean
}

// roles should come from somewhere else (maybe Dato?)
const ROLES = [
  'writing',
  'editing',
  'fact-checking',
  'proofreading',
  'translation',
  'pictures',
  'illustration',
  'visual editing',
  'data visulalization',
  'voice over',
  'audio editing',
]

const ContributorForm = ({
  handleAddContributor,
}: {
  handleAddContributor: (contributor: Contributor) => void
}) => {
  const [author, setAuthor] = useState('')
  const [role, setRole] = useState('')
  const [main, setMain] = useState(false)

  const roleKinds = ROLES.map((role) => ({
    value: role,
    text: role,
  }))

  const resetForm = () => {
    setAuthor('')
    setMain(false)
  }

  const addContributor = () => {
    if (!author || !role) return
    handleAddContributor({ author, role, main })
    resetForm()
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60fr 40fr',
          columnGap: '2rem',
        }}
      >
        <Field
          label='author'
          value={author}
          type='text'
          onChange={(_, value) => {
            setAuthor(value as string)
          }}
        />
        <Dropdown
          label='role'
          items={roleKinds}
          value={role}
          onChange={({ value }) => {
            setRole(value)
          }}
        />
        <div style={{ gridRow: 2 }}>
          <Checkbox
            checked={main}
            onChange={(_, checked) => setMain(checked)}
            black
          >
            main contributor
          </Checkbox>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Button small onClick={addContributor}>
          Add this contributor
        </Button>
      </div>
      <p>
        <b>Add an article contributor:</b> Specify the name, the role and if
        this contributor should appear in the main byline, inside the title
        block.
      </p>
    </div>
  )
}

const ContributorsList = ({
  contributors,
  handleDeleteContributor,
  main,
}: {
  contributors: Contributor[]
  handleDeleteContributor: (contributor: Contributor) => void
  main?: boolean
}) => {
  if (!contributors || contributors.length === 0) {
    return null
  }
  return (
    <div style={{ marginBottom: '1rem' }}>
      <Label>{main ? 'Main contributors' : 'Secondary contributors'}</Label>
      {contributors.map((contributor, idx) => (
        <div
          key={idx}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Interaction.P>
            {contributor.author} ({contributor.role})
          </Interaction.P>
          <IconButton
            Icon={IconClose}
            onClick={() => handleDeleteContributor(contributor)}
          />
        </div>
      ))}
    </div>
  )
}

// NOTES:
// - the order in which the contributors are listed here doesn't matter
// - in the frontend, the contributors are grouped by their role and sorted by their last name
export default withT(({ editor, node }) => {
  const contributors = (node.data.get(CONTRIBUTORS_KEY) || []) as Contributor[]

  const handleContributorsChange = (nextState: Contributor[]) => {
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data:
          nextState && nextState.length > 0
            ? node.data.set(CONTRIBUTORS_KEY, nextState)
            : node.data.remove(CONTRIBUTORS_KEY),
      })
    })
  }

  const handleAddContributor = (contributor: Contributor) =>
    handleContributorsChange(contributors.concat(contributor))

  const handleDeleteContributor = (toDelete: Contributor) => {
    handleContributorsChange(
      contributors.filter((c) => c.author !== toDelete.author),
    )
  }

  return (
    <MetaSection>
      <MetaSectionTitle>Contributors</MetaSectionTitle>
      <ContributorsList
        main
        handleDeleteContributor={handleDeleteContributor}
        contributors={contributors.filter((c) => c.main)}
      />
      <ContributorsList
        handleDeleteContributor={handleDeleteContributor}
        contributors={contributors.filter((c) => !c.main)}
      />

      <ContributorForm handleAddContributor={handleAddContributor} />
    </MetaSection>
  )
})
