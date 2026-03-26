'use client'
import { EditInline } from '@/components/edit-inline'
import {
  UpdateUserDetailsDocument,
  UpdateUserDetailsMutationVariables,
  UserProfileDocument,
} from '@/graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Button, Field, Form, Input } from '@republik/ui'
import Link from 'next/link'

export function EditUserDetails({
  userId,
  values,
  onComplete,
}: {
  userId: string
  values: UpdateUserDetailsMutationVariables
  onComplete?: () => void
}) {
  const [updateUserDetails, { loading, error }] = useMutation(
    UpdateUserDetailsDocument,
    {},
  )

  const formErrors = error ? { email: error?.message } : {}

  return (
    <Form
      errors={formErrors}
      onFormSubmit={async (values) => {
        try {
          await updateUserDetails({ variables: { id: userId, ...values } })
          onComplete?.()
        } catch {}
      }}
    >
      <Field.Root name='firstName' label='Vorname'>
        <Input required type='text' defaultValue={values.firstName} />
      </Field.Root>
      <Field.Root name='lastName' label='Nachname'>
        <Input required type='text' defaultValue={values.lastName} />
      </Field.Root>
      <Field.Root name='phoneNumber' label='Telefon'>
        <Input type='text' defaultValue={values.phoneNumber} />
      </Field.Root>
      <Field.Root name='birthyear' label='Geburtsjahr'>
        <Input type='number' defaultValue={values.birthyear} />
      </Field.Root>

      <div>
        <Button type='submit' disabled={loading}>
          Ändern
        </Button>
      </div>
    </Form>
  )
}

export function UserDetails({ userId }: { userId: string }) {
  const { data } = useQuery(UserProfileDocument, {
    variables: {
      id: userId,
    },
  })

  return (
    <div>
      <h2>Personalien</h2>
      <div>
        {data?.user?.firstName} {data?.user?.lastName}
      </div>
      <h2>E-Mail-Adresse</h2>
      <Link href={`mailto:${data?.user?.email}`}>{data?.user?.email}</Link>
      <h2>Adresse</h2>
      <div>{data?.user?.address.organization}</div>
      <div>{data?.user?.address.name}</div>
      <div>{data?.user?.address.line1}</div>
      <div>{data?.user?.address.line2}</div>
      <div>{data?.user?.address.postalCode}</div>
      <div>{data?.user?.address.city}</div>
      <div>{data?.user?.address.country}</div>
    </div>
  )
}
