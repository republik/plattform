import React from 'react'
import MoreIcon from 'react-icons/lib/md/more-vert'
import Callout from './index'
import uuid from 'uuid/v4'
import { plainButtonRule } from '../Button'

const CalloutMenu = ({ menu, styles }) => {
  const [showMenu, setMenu] = React.useState(false)
  const toggleRef = React.useRef()

  return menu ? (
    <div id={uuid()} ref={toggleRef} {...styles}>
      <button
        {...plainButtonRule}
        onClick={() => {
          setMenu(!showMenu)
        }}
      >
        <MoreIcon width='calc(1em + 7px)' />
      </button>
      {showMenu && (
        <Callout toggleRef={toggleRef} onClose={setMenu(false)}>
          {menu}
        </Callout>
      )}
    </div>
  ) : null
}

export default CalloutMenu
