import React, { Fragment } from 'react'

import { linkRule, Label } from '@project-r/styleguide'

import { Link } from '../../../lib/routes'
import { GITHUB_ORG } from '../../../lib/settings'

// setter for testing
let githubOrg = GITHUB_ORG
export const setOrg = value => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      'utils.github.setOrg can only be used in the TEST environment'
    )
  }
  githubOrg = value
}

const regex = /^https:\/\/github.com\/([^/]+)\/([^/?]+)\??([^#]*)#?(.*)/
export const extract = value => {
  const info = String(value).match(regex)
  if (!info || info[1] !== githubOrg) {
    return null
  }
  return {
    id: `${info[1]}/${info[2]}`,
    name: info[2],
    query: info[3],
    hash: info[4]
  }
}

const nada = () => null

export const RepoLink = ({
  value,
  Wrapper = Fragment,
  invalid = nada,
  autoSlug
}) => {
  const info = extract(value)
  if (!info) {
    return invalid(info)
  }
  if (autoSlug && info.query !== 'autoSlug') {
    return invalid(info)
  }
  return (
    <Wrapper>
      <Link
        route='repo/tree'
        params={{
          repoId: info.id.split('/')
        }}
      >
        <a {...linkRule}>
          {info.name}
          {info.hash ? `#${info.hash}` : ''}
        </a>
      </Link>
    </Wrapper>
  )
}

export const AutoSlugLinkInfo = ({ label, value }) => (
  <RepoLink
    value={value}
    autoSlug
    Wrapper={({ children }) => (
      <Label style={{ display: 'block', marginTop: -5, marginBottom: 10 }}>
        {label} {children}
      </Label>
    )}
  />
)
