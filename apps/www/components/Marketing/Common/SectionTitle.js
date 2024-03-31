import { css } from 'glamor'
import { fontStyles, Editorial } from '@project-r/styleguide'

export default function SectionTitle({ title, lead }) {
  return (
    <div {...styles.container}>
      <h2 {...styles.title}>{title}</h2>
      {lead ? (
        <Editorial.Lead style={{ lineHeight: '2.2rem' }}>{lead}</Editorial.Lead>
      ) : null}
    </div>
  )
}

const styles = {
  container: css({
    margin: '0 auto',
    maxWidth: 720,
    textAlign: 'center',
    marginBottom: '2em',
  }),
  title: css({
    ...fontStyles.sansSerifMedium30,
    marginBlock: '0.8em',
  }),
}
