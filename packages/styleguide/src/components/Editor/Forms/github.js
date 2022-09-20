import React, { Fragment } from 'react'
import { PlaceholderLink } from '../Render/Context'
import { A, Label } from '../../Typography'

const regex = /^https:\/\/github.com\/([^/]+)\/([^/?]+)\??([^#]*)#?(.*)/
export const extract = (value) => {
  const info = String(value).match(regex)
  if (!info) {
    return null
  }
  return {
    id: `${info[1]}/${info[2]}`,
    name: info[2],
    query: info[3],
    hash: info[4],
  }
}

const nada = () => null

export const RepoLink = ({
  value,
  Wrapper = Fragment,
  invalid = nada,
  autoSlug,
  Link,
}) => {
  const info = extract(value)
  // console.log({ info, value })
  if (!info) {
    return invalid(info)
  }
  if (autoSlug && !info.query.match(/(^|&)autoSlug([=&#].+)?$/)) {
    return invalid(info)
  }
  return (
    <Wrapper>
      <Link href={`/repo/${info.id}/tree`} passHref>
        <A href={`/repo/${info.id}/tree`}>
          {info.name}
          {info.hash ? `#${info.hash}` : ''}
        </A>
      </Link>
    </Wrapper>
  )
}

export const AutoSlugLinkInfo = ({ label, value, Link = PlaceholderLink }) => (
  <RepoLink
    value={value}
    Link={Link}
    autoSlug
    Wrapper={({ children }) => (
      <Label style={{ display: 'block', marginTop: -5, marginBottom: 10 }}>
        {label} {children}
      </Label>
    )}
  />
)
