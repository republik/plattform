import { useState, useEffect } from 'react';
import { css } from 'glamor'

import { Interaction, A, Field } from '@project-r/styleguide'

const { H2, P } = Interaction

const styles = {
  form: css({
    marginBottom: 40,
  }),
}

const Form = (props) => {
  const [name, setName] = useState({ value: props.name })
  const [entity, setEntity] = useState({ value: props.entity })
  const [position, setPosition] = useState({ value: props.position })

  const handleName = (value, shouldValidate) => {
    setName({
      ...name,
      value,
      error: value.trim().length === 0 && 'Name fehlt',
      dirty: shouldValidate,
    })
  }

  const handleEntity = (value, shouldValidate) => {
    setEntity({
      ...entity,
      value,
      error: value.trim().length === 0 && 'Rechtsform fehlt',
      dirty: shouldValidate,
    })
  }

  const handlePosition = (value, shouldValidate) => {
    setPosition({
      ...position,
      value,
      error: value.trim().length === 0 && 'Position fehlt',
      dirty: shouldValidate,
    })
  }

  const commit = (e) => {
    e && e.preventDefault && e.preventDefault()

    handleName(name.value, true)
    handleEntity(entity.value, true)
    handlePosition(position.value, true)

    const errors = [name.error, entity.error, position.error].filter(Boolean)

    if (errors.length > 0) {
      return
    }

    props.onCommit(props.id, {
      name: name.value,
      entity: entity.value,
      position: position.value,
    })
  }

  const cancel = (e) => {
    e && e.preventDefault && e.preventDefault()

    props.onCancel(props.id)
  }

  return (
    <div {...styles.form}>
      <Field
        label='Bezeichnung'
        value={name.value}
        error={name.dirty && name.error}
        dirty={name.dirty}
        onChange={(_, value, shouldValidate) =>
          handleName(value, shouldValidate)
        }
      />
      <Field
        label='Rechtsform'
        value={entity.value}
        error={entity.dirty && entity.error}
        dirty={entity.dirty}
        onChange={(_, value, shouldValidate) =>
          handleEntity(value, shouldValidate)
        }
      />
      <Field
        label='Position'
        value={position.value}
        error={position.dirty && position.error}
        dirty={position.dirty}
        onChange={(_, value, shouldValidate) =>
          handlePosition(value, shouldValidate)
        }
      />

      <P>
        <A href='#uebernehmen' onClick={commit}>
          Übernehmen
        </A>{' '}
        <A href='#abbrechen' onClick={cancel}>
          Abbrechen
        </A>
      </P>
    </div>
  )
}

const VestedInterests = ({ vestedInterests, handleVestedInterests }) => {
  const [interests, setInterests] = useState(vestedInterests.value)
  const [counter, setCounter] = useState(vestedInterests.value.length)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => handleVestedInterests(interests, false), [interests])

  const addInterest = (e) => {
    e && e.preventDefault && e.preventDefault()

    const id = `interest${counter}`

    setInterests([
      ...interests,
      {
        id,
        name: '',
        entity: '',
        position: '',
      },
    ])

    setCounter(counter + 1)
    setIsEditing(id)
  }

  const removeInterest = (e, id) => {
    e && e.preventDefault && e.preventDefault()

    const updatedInterests = [...interests].filter(
      (interest) => interest.id !== id,
    )
    setInterests([...updatedInterests])
  }

  const editInterest = (e, id) => {
    e && e.preventDefault && e.preventDefault()

    setIsEditing(id)
  }

  const replaceInterest = (id, interest) => {
    const updatedInterests = [...interests]
    const index = updatedInterests.findIndex((interest) => interest.id === id)

    if (index < 0) {
      return
    }

    updatedInterests[index] = { ...interest, id }

    setIsEditing(false)
    setInterests([...updatedInterests])
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  return (
    <>
      <H2>Interessenbindungen</H2>
      <ul>
        {interests.map((interest) => {
          return (
            <li key={interest.id}>
              {interest.id === isEditing ? (
                <Form
                  {...interest}
                  onCommit={replaceInterest}
                  onCancel={cancelEditing}
                />
              ) : (
                <>
                  <P>
                    {interest.name} ({interest.entity}); {interest.position}
                  </P>
                  <P>
                    <A
                      href='#aendern'
                      onClick={(e) => editInterest(e, interest.id)}
                    >
                      Ändern
                    </A>{' '}
                    <A
                      href='#entfernen'
                      onClick={(e) => removeInterest(e, interest.id)}
                    >
                      Entfernen
                    </A>
                  </P>
                </>
              )}
            </li>
          )
        })}
      </ul>

      <P>
        <A href='#interessenbindung' onClick={addInterest}>
          Interessenbindung hinzufügen
        </A>
      </P>
    </>
  )
}

export default VestedInterests
