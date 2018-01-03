import React from 'react'
import {
  Sub as ImportedSub,
  Sup as ImportedSup
} from '../../../components/Typography'

export const Sub = ({ children }) => (
  <ImportedSub style={{ lineHeight: 0 }}>{children}</ImportedSub>
)
export const Sup = ({ children }) => (
  <ImportedSup style={{ lineHeight: 0 }}>{children}</ImportedSup>
)
