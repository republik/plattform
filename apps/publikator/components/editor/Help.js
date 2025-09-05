import { A } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  container: css({
    padding: '15px',
    backgroundColor: '#fff',
    '& p': {
      fontSize: 14,
      margin: '0 0 10px 0',
    },
  }),
}
const Help = () => (
  <div {...styles.container}>
    <p>
      <A href='https://republikmagazin.notion.site' target='_blank'>
        Storytelling toolbox
      </A>
    </p>
  </div>
)

export default Help
