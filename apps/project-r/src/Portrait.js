import React from 'react'
import {css} from 'glamor'

const portraitStyle = css({
  margin: '0 0 15px',
  '& h2': {
    fontSize: 24
  },
  '& p': {
    marginBottom: '0.2em'
  },
  '& p:last-child': {
    marginBottom: '0.8em'
  },
  ':after': {
    content: '""',
    display: 'table',
    clear: 'both'
  }
})

const mqMedium = '@media (min-width: 600px)'
const portraitImageLeftStyle = css({
  [mqMedium]: {
    float: 'left',
    width: '50%',
    marginTop: 3,
    marginRight: 20,
    marginBottom: 10
  }
})
const portraitImageRightStyle = css({
  [mqMedium]: {
    float: 'right',
    width: '50%',
    marginTop: 3,
    marginLeft: 20,
    marginBottom: 10
  }
})

export const RawPortrait = ({image, children, odd}) => (
  <div {...portraitStyle}>
    <img className={odd ? portraitImageLeftStyle : portraitImageRightStyle} src={image} alt='' />
    {children}
  </div>
)

const Portrait = ({odd, image, description, name, age, title, email}) => (
  <RawPortrait odd={odd} image={image}>
    <h2>{name},&nbsp;{age}</h2>
    <h3>{title}</h3>
    <p>{description}</p>
    <p><a href={`mailto:${email}`}>{email}</a></p>
  </RawPortrait>
)

export default Portrait
