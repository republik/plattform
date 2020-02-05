import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { useColorContext } from '../../components/Colors/useColorContext'

const ArticleContainer = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      style={{
        backgroundColor: colorScheme.containerBg
      }}
    >
      {children}
    </div>
  )
}

export default ArticleContainer
