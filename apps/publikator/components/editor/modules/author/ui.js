import { Fragment } from 'react'
import { createBlockButton, buttonStyles, matchBlock } from '../../utils'
import injectBlock from '../../utils/injectBlock'

import { Label } from '@project-r/styleguide'
import { AuthorSearch } from '@project-r/styleguide/editor'
import { Text } from 'slate'

export default ({ TYPE, newBlock, editorOptions }) => {
  const InsertButton = createBlockButton({
    type: TYPE,
    reducer: (props) => (event) => {
      const { onChange, value } = props
      event.preventDefault()

      return onChange(value.change().call(injectBlock, newBlock))
    },
  })(({ active, disabled, visible, ...props }) => {
    return (
      <span
        {...buttonStyles.block}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
      >
        {editorOptions.insertButtonText}
      </span>
    )
  })

  const Form = ({ value, onChange }) => {
    if (!value.blocks.some(matchBlock(TYPE))) {
      return null
    }

    const authors = value.blocks.filter(matchBlock(TYPE))

    const authorChange = (onChange, value, node) => (author) => {
      onChange(
        value.change().setNodeByKey(node.key, {
          data: {
            authorId: author.value.id,
            // explicit mapping to avoid leaking to the tree
            // - e.g. value.email
            // - tree will eventually be published
            resolvedAuthor: {
              name: author.value.name,
              slug: author.value.slug,
              portrait: author.value.portrait,
              credentials: author.value.credentials,
            },
          },
        }),
      )
    }

    return (
      <div>
        <Label>Autorin</Label>
        {authors.map((node, i) => (
          <Fragment key={i}>
            <AuthorSearch onChange={authorChange(onChange, value, node)} />
          </Fragment>
        ))}
      </div>
    )
  }

  return {
    forms: [Form],
    insertButtons: [InsertButton],
  }
}
