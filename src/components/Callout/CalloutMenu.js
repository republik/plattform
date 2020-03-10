import React from 'react'
import MoreIcon from 'react-icons/lib/md/more-vert'
import Callout from './index'
import uuid from 'uuid/v4'

const CalloutMenu = ({ menu, styles }) => {
  const [showMenu, setMenu] = React.useState(false)
  const toggleRef = React.useRef()

  return menu ? (
    <div id={uuid()} ref={toggleRef} {...styles}>
      <MoreIcon
        width='calc(1em + 7px)'
        onClick={() => {
          setMenu(!showMenu)
        }}
      />
      <Callout toggleRef={toggleRef} expanded={showMenu} setExpanded={setMenu}>
        {menu}
      </Callout>
    </div>
  ) : null
}

export default CalloutMenu
