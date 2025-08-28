import { css } from 'glamor'

import {
  P,
  Interaction,
  A,
  Label,
  mediaQueries,
  slug,
} from '@project-r/styleguide'

import { HEADER_HEIGHT } from './constants'

const portraitStyle = css({
  position: 'relative',
  marginBottom: 30,
  [mediaQueries.mUp]: {
    marginBottom: 60,
  },
  '& img': {
    maxWidth: '100%',
  },
})

const anchorStyle = css({
  position: 'absolute',
  top: -(HEADER_HEIGHT + 10),
})

const portraitImageLeftStyle = css({
  [mediaQueries.mUp]: {
    float: 'left',
    width: '60%',
    marginTop: 3,
    marginRight: 20,
    marginBottom: 10,
  },
})
const portraitImageRightStyle = css({
  [mediaQueries.mUp]: {
    float: 'right',
    width: '60%',
    marginTop: 3,
    marginLeft: 20,
    marginBottom: 10,
  },
})

const Portrait = ({ odd, image, description, name, age, title, email }) => (
  <div {...portraitStyle}>
    <a id={slug(name)} {...anchorStyle} />
    <Interaction.H3 style={{ marginBottom: 0 }}>
      {name},&nbsp;{age}
    </Interaction.H3>
    <Label>{title}</Label>
    <br />
    <br />
    <img
      className={odd ? portraitImageLeftStyle : portraitImageRightStyle}
      src={image}
      alt=''
    />
    <P style={{ marginTop: 0, marginBottom: 10 }}>{description}</P>
    <Interaction.P>
      <A href={`mailto:${email}`}>{email}</A>
    </Interaction.P>
  </div>
)

export default Portrait
