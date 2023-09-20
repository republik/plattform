import React from 'react'

type Props = { text?: string }

const PinkText: React.FC<Props> = ({ text }) => (
  <p style={{ color: 'pink' }}>Hello{text ? ` ${text}` : ''}!</p>
)

export default PinkText
