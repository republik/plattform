'use client'
import { Card, CardTitle } from '@/components/card'
import { Button, Form, Input } from '@/components/ui'
import { InlineField, TextField } from '@/components/ui/forms/field'
import { useToastManager } from '@/components/ui/toast'
import {
  UpdateUserDetailsDocument,
  UpdateUserDetailsMutationVariables,
} from '@/graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import Link from 'next/link'
import { z } from 'zod'
import { useUserProfileData } from './use-user-profile-data'
import { Radio, RadioGroup } from '@/components/ui/forms/radio'

const OptionalString = z.preprocess(
  (val) => (val === '' ? null : val),
  z.string().nullable(),
)
const OptionalNumber = z.preprocess(
  (val) => (val === '' ? null : val),
  z.coerce.number().nullable(),
)
const UserFormInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: OptionalString,
  gender: OptionalString,
  birthyear: OptionalNumber,
})

export function EditUserDetails({
  userId,
  values,
}: {
  userId: string
  values: UpdateUserDetailsMutationVariables
  onComplete?: () => void
}) {
  const toastManager = useToastManager()

  const [updateUserDetails, { loading, error }] = useMutation(
    UpdateUserDetailsDocument,
    {
      onError: (err) => {
        toastManager.add({
          title: 'Ups!',
          description: err.message,
          type: 'error',
        })
      },
    },
  )

  const formErrors = error ? { email: error?.message } : {}

  return (
    <Form
      errors={formErrors}
      onFormSubmit={(values) => {
        const fields = UserFormInput.parse({
          ...values,
          gender: values.selectedGender || values.customGender,
        })

        console.log(fields)

        updateUserDetails({ variables: { id: userId, ...fields } })
      }}
    >
      <TextField name='firstName' label='Vorname'>
        <Input required type='text' defaultValue={values.firstName} />
      </TextField>
      <TextField name='lastName' label='Nachname'>
        <Input required type='text' defaultValue={values.lastName} />
      </TextField>
      <TextField name='phoneNumber' label='Telefon'>
        <Input type='text' defaultValue={values.phoneNumber} />
      </TextField>
      <TextField name='birthyear' label='Geburtsjahr'>
        <Input type='number' defaultValue={values.birthyear} />
      </TextField>

      <RadioGroup name='selectedGender' defaultValue={values.gender}>
        <InlineField label='Männlich'>
          <Radio value='männlich' />
        </InlineField>
        <InlineField label='Weiblich'>
          <Radio value='weiblich' />
        </InlineField>
      </RadioGroup>
      <TextField name='customGender' label='Geschlecht'>
        <Input type='text' defaultValue={values.gender} />
      </TextField>
      <div>
        <Button type='submit' disabled={loading}>
          Ändern
        </Button>
      </div>
    </Form>
  )
}

export function UserDetails() {
  const user = useUserProfileData()

  if (!user) return null

  const { email, address } = user

  return (
    <Card>
      <CardTitle>E-Mail-Adresse</CardTitle>
      <Link href={`mailto:${email}`}>{email}</Link>

      <CardTitle>Adresse</CardTitle>
      {address ? (
        <div>
          <div>{address.organization}</div>
          <div>{address.name}</div>
          <div>{address.line1}</div>
          <div>{address.line2}</div>
          <div>{address.postalCode}</div>
          <div>{address.city}</div>
          <div>{address.country}</div>
        </div>
      ) : (
        '–'
      )}

      <Link href={`/users/${user.id}/details`}>Bearbeiten</Link>
    </Card>
  )
}
