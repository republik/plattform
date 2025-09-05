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
      <b>
        <a href='https://republikmagazin.notion.site' target='_blank'>
          Toolbox
        </a>
      </b>
    </p>
  </div>
)

export default Help
