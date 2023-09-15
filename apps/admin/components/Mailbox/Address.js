import { Fragment, useState } from 'react'
import { A } from '@project-r/styleguide'
import Link from 'next/link'

const Address = ({ address: _address }) => {
  const { address, name, user } = _address

  if (user) {
    return (
      <Link href={`/users/${user.id}`} passHref legacyBehavior>
        <A>{user.name || address}</A>
      </Link>
    );
  }

  const label = [!name && address, name, name && `<${address}>`]
    .filter(Boolean)
    .join(' ')

  return label
}

export default Address

export const Bucket = ({ addresses, min = 5 }) => {
  const [expanded, setExpanded] = useState()

  const expand = (e) => {
    e.preventDefault()
    setExpanded(true)
  }

  return (
    <>
      {addresses
        ?.filter((_, index) => expanded || index < min)
        .map((address, index) => (
          <Fragment key={index}>
            <Address address={address} />
            {index + 1 < addresses.length && ', '}
          </Fragment>
        ))}
      {!expanded && addresses.length > min && (
        <>
          …{' '}
          <A href='#' onClick={expand}>
            mehr
          </A>
        </>
      )}
    </>
  )
}
