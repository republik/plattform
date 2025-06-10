import { useTranslation } from '../../lib/withT'
import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'
import { Interaction } from '@project-r/styleguide'
import Link from 'next/link'
import { A } from '@project-r/styleguide'
import { IconDiscussion } from '@republik/icons'
import { ListWithQuery as TestimonialList } from '../Testimonial/List'
import ActiveDiscussions from './ActiveDiscussions'

const styles = {
  h3: css({
    marginTop: 24,
    marginBottom: 4,
  }),
}

const DialogOverviewPage = () => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
  return (
    <>
      <Interaction.Headline>{t('feedback/title')}</Interaction.Headline>
      <Interaction.P>{t('feedback/lead')}</Interaction.P>
      <Interaction.H3 {...styles.h3}>{t('feedback/activeDiscussions/label')}</Interaction.H3>
      <ActiveDiscussions first={5} />
      <Interaction.H3 {...styles.h3}>{t('marketing/community/title/plain')}</Interaction.H3>
      <TestimonialList singleRow minColumns={3} first={5} share={false} />
      <Link href='/community' passHref legacyBehavior>
        <A>{t('marketing/community/link')}</A>
      </Link>
      <Interaction.H3 {...styles.h3}>Feedback</Interaction.H3>
      <Interaction.P style={{ marginTop: 10 }}>
        <Link
          href={{
            pathname: '/feedback',
          }}
          passHref
          legacyBehavior
        >
          <A>{t('feedback/link/general')}</A>
        </Link>
      </Interaction.P>
      <Interaction.H3 {...styles.h3}>{t('feedback/latestComments/headline')}</Interaction.H3>
      <LatestComments />
    </>
  )
}

export default DialogOverviewPage
