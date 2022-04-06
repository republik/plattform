import compose from 'lodash/flowRight'
import withT from '../../lib/withT'

import { InfoBoxTitle, InfoBoxText, A } from '@project-r/styleguide'
import Link from 'next/link'

const AutoDiscussionTeaser = ({ t, discussionId }) => (
  <div>
    <InfoBoxTitle>{t('article/autodiscussionteaser/title')}</InfoBoxTitle>
    <InfoBoxText>
      {t.elements('article/autodiscussionteaser/text', {
        link: (
          <Link
            key='feedback'
            href={{
              pathname: '/dialog',
              query: { t: 'article', id: discussionId },
            }}
            passHref
          >
            <A>{t('article/autodiscussionteaser/linktext')}</A>
          </Link>
        ),
      })}
    </InfoBoxText>
  </div>
)

export default compose(withT)(AutoDiscussionTeaser)
