import React, { useState, useEffect } from 'react'
import { css } from 'glamor'
import { Interaction } from '../Typography'
import Spinner from '../Spinner'
import { useColorContext } from '../Colors/ColorContext'
import { ApolloError } from '@apollo/client'

const { P } = Interaction

const styles = {
  message: css({
    position: 'absolute',
    top: '50%',
    marginTop: 30,
    width: '100%',
    textAlign: 'center',
  }),
  spacer: css({
    position: 'relative',
    minHeight: 120,
    height: '100%',
    minWidth: '100%',
  }),
}

type SpacerProps = {
  children?: React.ReactNode
  style?: React.CSSProperties
}

const Spacer = ({ style, children }: SpacerProps) => (
  <div {...styles.spacer} style={style}>
    {children}
  </div>
)

interface GraphQLError extends Error {
  graphQLErrors?: Error[]
}

type LoaderProps = {
  style?: React.CSSProperties
  message?: React.ReactNode
  loading: boolean
  error?: GraphQLError | ApolloError
  render?: () => React.ReactElement
  delay?: number
  ErrorContainer?: React.ComponentType<{ children: React.ReactNode }>
}

const Loader = ({
  style,
  message,
  loading,
  error,
  render = () => null,
  delay = 500,
  ErrorContainer = ({ children }) => children,
}: LoaderProps) => {
  const [visible, setVisible] = useState(false)
  const [colorScheme] = useColorContext()

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (loading && !visible) {
    return <Spacer style={style} />
  } else if (loading) {
    return (
      <Spacer style={style}>
        <Spinner />
        {!!message && (
          <P {...styles.message} {...colorScheme.set('color', 'text')}>
            {message}
          </P>
        )}
      </Spacer>
    )
  } else if (error) {
    return (
      <ErrorContainer>
        <P {...colorScheme.set('color', 'error')}>
          {error.graphQLErrors && error.graphQLErrors.length
            ? error.graphQLErrors.map((e) => e.message).join(', ')
            : error.toString()}
        </P>
      </ErrorContainer>
    )
  }
  return render()
}

export default Loader
