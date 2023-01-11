import { css } from 'glamor'
import { gql } from '@apollo/client'

import {
  Interaction,
  mediaQueries,
  RawHtml,
  Button,
} from '@project-r/styleguide'

import Section from '../../Onboarding/Section'

import { useTranslation } from '../../../lib/withT'
import PostcardGenerator from '../Postcard/PostcardGenerator'

const styles = {
  p: css({
    marginBottom: 20,
  }),
  actions: css({
    marginBottom: 20,
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    width: 160,
    '& > button': {
      flexGrow: 1,
      margin: '5px 15px 0 0',
      minWidth: '120px',
      [mediaQueries.mUp]: {
        flexGrow: 0,
        margin: '5px 15px 0 0',
        minWidth: '160px',
      },
    },
  }),
}

export const fragments = {
  postcard: gql`
    fragment Postcard on queries {
      postcard: questionnaire(slug: "klima-postkarte") {
        id
        userHasSubmitted
      }
    }
  `,
}

const Postcard = (props) => {
  const { postcard, onContinue } = props
  const { t } = useTranslation()

  return (
    <Section
      heading={t('Climatelab/Onboarding/Postcard/heading')}
      showContinue={postcard.userHasSubmitted}
      isTicked={postcard.userHasSubmitted}
      {...props}
    >
      <>
        <RawHtml
          {...styles.p}
          type={Interaction.P}
          dangerouslySetInnerHTML={{
            __html: t(['Climatelab/Onboarding/Postcard/paragraph1'], null, ''),
          }}
        />
        <PostcardGenerator />
        <br />
        {!postcard.userHasSubmitted && (
          <div {...styles.actions}>
            <Button block onClick={onContinue}>
              {t('Onboarding/Sections/Profile/button/continue', null, '')}
            </Button>
          </div>
        )}
      </>
    </Section>
  )
}

export default Postcard
