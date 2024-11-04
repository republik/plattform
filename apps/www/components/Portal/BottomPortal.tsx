import { css } from 'glamor'

const styles = {
  portal: css({
    position: 'fixed',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    bottom: 0,
    paddingRight: 'calc(15px + env(safe-area-inset-right))',
    paddingLeft: 'calc(15px + env(safe-area-inset-left))',
    paddingBottom: 'calc(15px + env(safe-area-inset-bottom))',
  }),
}

export default function BottomPortal() {
  return <div {...styles.portal} id='bottomPortal' />
}
