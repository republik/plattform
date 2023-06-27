import React from 'react'

type Props = { text?: string }

const BlueText: React.FC<Props> = ({ text }) => (
  <p style={{ color: 'blue' }}>Hello{text ? ` ${text}` : ''}!</p>
)

export default BlueText
