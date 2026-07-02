'use client'
import { dynamicComponentIdentifiers } from '@/components/Article/DynamicComponents'
import type { DynamicComponent as DynamicComponentT } from '@/sanity.types'
import { ApolloConsumer, ApolloProvider, gql } from '@apollo/client'
import { Mutation, Query, Subscription } from '@apollo/client/react/components'
import {
  graphql,
  withApollo,
  withMutation,
  withQuery,
  withSubscription,
} from '@apollo/client/react/hoc'
import {
  createRequire,
  DynamicComponent,
  RootColorVariables,
} from '@project-r/styleguide'
import { cva } from '@republik/theme/css'
import compose from 'lodash/flowRight'
import { stegaClean } from 'next-sanity'

const dynamicComponentRequire = createRequire().alias({
  'react-apollo': {
    // Reexport react-apollo
    // (work around until all dynamic components are updated)
    // ApolloContext is no longer available but is exported in old versions of react-apollo
    ApolloConsumer,
    ApolloProvider,
    Query,
    Mutation,
    Subscription,
    graphql,
    withQuery,
    withMutation,
    withSubscription,
    withApollo,
    compose,
  },
  // Reexport graphql-tag to be used by dynamic-components
  'graphql-tag': gql,
})

const figureStyle = cva({
  base: {
    '& > figcaption': {
      mt: '1',
    },
  },
  variants: {
    size: {
      NORMAL: {},
      BREAKOUT: {
        gridColumn: 'breakout',
      },
      FULL: {
        gridColumn: 'full',
        '& > figcaption': {
          ml: '4',
        },
      },
    },
  },
})

export function LegacyDynamicComponent({
  value,
}: {
  value: DynamicComponentT
}) {
  if (!value.src && !value.identifier) {
    return null
  }

  let componentName = 'unknown'
  if (value.src) {
    const src = new URL(value.src)
    const match = src.pathname.match(
      /\/dynamic-components\/([a-z0-9\-]+)\/([a-z0-9\-]+)\.js/,
    )
    componentName = match
      ? match[2] === 'index'
        ? match[1]
        : `${match[1]}-${match[2]}`
      : null
  } else if (value.identifier) {
    componentName = value.identifier
  }

  // Attention: JSON is only valid if Sanity Stega chars are removed
  const props = JSON.parse(stegaClean(value.props?.code ?? '{}'))

  return (
    <div
      data-dynamic-component={`${componentName}`}
      className={figureStyle({ size: value.size })}
    >
      <RootColorVariables />
      <DynamicComponent
        require={dynamicComponentRequire}
        identifiers={dynamicComponentIdentifiers}
        identifier={value.identifier}
        src={value.src}
        // size={value.size}
        autoHtml={value.autoHtml}
        html={value.html}
        props={props}
      />
    </div>
  )
}
