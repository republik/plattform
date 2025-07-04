import { AuthorSearch, Checkbox, Field, Label } from '@project-r/styleguide'
import { Fragment } from 'react'
import { buttonStyles, createBlockButton, matchBlock } from '../../utils'
import createOnFieldChange from '../../utils/createOnFieldChange'
import injectBlock from '../../utils/injectBlock'

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
    const handlerFactory = createOnFieldChange(onChange, value)

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
            isLarge: author.value.isLarge,
            greeting: author.value.greeting,
          },
        }),
      )
    }

    return (
      <div>
        <Label>Autorin</Label>
        {authors.map((node, i) => {
          const onInputChange = handlerFactory(node)
          const checked = node.data.get('isLarge') === true
          return (
            <Fragment key={i}>
              <AuthorSearch onChange={authorChange(onChange, value, node)} />
              <Checkbox
                checked={checked}
                onChange={(_) => {
                  let change = value.change().setNodeByKey(node.key, {
                    data: node.data.merge({ ['isLarge']: !checked }),
                  })
                  onChange(change)
                }}
              >
                Gross
              </Checkbox>
              {checked && (
                <Field
                  label={'Begrüssung'}
                  value={node.data.get('greeting')}
                  onChange={onInputChange('greeting')}
                />
              )}
            </Fragment>
          )
        })}
      </div>
    )
  }

  return {
    forms: [Form],
    insertButtons: [InsertButton],
  }
}
