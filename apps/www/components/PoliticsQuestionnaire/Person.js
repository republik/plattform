import { screenshotUrl } from '@app/lib/util/screenshot-api'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import {
  Center,
  ColorContextProvider,
  Editorial,
  Figure,
  FigureByline,
  FigureCaption,
  FigureImage,
  IconButton,
  Interaction,
  NarrowContainer,
  useColorContext,
  useHeaderHeight,
} from '@project-r/styleguide'

import { IconRadioChecked, IconRadioUnchecked } from '@republik/icons'

import { PUBLIC_BASE_URL } from '../../lib/constants'

import Frame from '../Frame'
import Meta from '../Frame/Meta'

import { ShareImage } from '../Questionnaire/Submissions/components/ShareImage'
import { styles as submissionStyles } from '../Questionnaire/Submissions/legacy/Submission'

import HeaderShare from './HeaderShare'

import { IconChevronLeft } from '@republik/icons'
import {
  ILLU_CREDIT,
  ILLU_SHARE,
  OVERVIEW_QUESTIONNAIRE_PATH,
  PERSON_SHARE_TEXT,
  QUESTIONNAIRE_BG_COLOR,
  QUESTIONNAIRE_FG_COLOR,
  QUESTIONNAIRE_SQUARE_IMG_URL,
} from './config'

import { cantonTranslation, partyTranslation } from './utils'

const Page = ({ responses, authorData }) => {
  const [headerHeight] = useHeaderHeight()
  const [colorScheme] = useColorContext()

  const router = useRouter()
  const {
    query: { image },
  } = router

  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('image', true)
  const shareImageUrl = shareImageUrlObj.toString()

  if (image) {
    return (
      <ShareImage
        user={authorData}
        img={ILLU_SHARE}
        fgColor={QUESTIONNAIRE_FG_COLOR}
        bgColor={QUESTIONNAIRE_BG_COLOR}
        personShareText={PERSON_SHARE_TEXT}
      />
    )
  }

  const meta = {
    url,
    title: '1 von 71 ausgefüllten Fragebogen aus dem Bundeshaus',
    description: '',
    image: screenshotUrl({ url: shareImageUrl, width: 1200 }),
  }

  return (
    <Frame raw>
      <Meta data={meta} />
      <div
        style={{
          backgroundColor: QUESTIONNAIRE_BG_COLOR,
          padding: '24px 0 24px',
        }}
      >
        <ColorContextProvider colorSchemeKey='light'>
          <div
            style={{
              paddingTop: 24,
              textAlign: 'center',
            }}
          >
            <Figure
              size='tiny'
              attributes={{ style: { position: 'relative' } }}
            >
              <FigureImage src={QUESTIONNAIRE_SQUARE_IMG_URL} />
              <FigureCaption>
                <FigureByline>{ILLU_CREDIT}</FigureByline>
              </FigureCaption>
            </Figure>
            <NarrowContainer style={{ padding: '20px 0' }}>
              <Interaction.Headline>
                {PERSON_SHARE_TEXT + ' ' + authorData.name}
              </Interaction.Headline>
              {/* {author?.profilePicture && (
                <img
                  src={author.profilePicture}
                  style={{
                    marginTop: 30,
                    width: 120,
                    borderRadius: 80,
                  }}
                />
              )} */}
            </NarrowContainer>
          </div>
        </ColorContextProvider>
      </div>
      <Center>
        <div
          {...submissionStyles.header}
          style={{
            top: headerHeight,
            padding: '10px 0',
            margin: '10px 0 0',
          }}
          {...colorScheme.set('backgroundColor', 'default')}
        >
          <div {...submissionStyles.headerText}>
            <NextLink
              href={OVERVIEW_QUESTIONNAIRE_PATH}
              passHref
              legacyBehavior
            >
              <IconButton
                size={24}
                label='Zur Übersicht'
                labelShort='Zur Übersicht'
                Icon={IconChevronLeft}
              />
            </NextLink>
          </div>
          <HeaderShare meta={meta} />
        </div>
        <Editorial.P>
          Partei: {partyTranslation(authorData.party)}
          <br />
          Wohnkanton: {cantonTranslation(authorData.canton)}
        </Editorial.P>

        {responses.map(({ question, answer, type, options, idx }) => (
          <QuestionAnswerPair
            key={idx}
            question={question}
            answer={answer}
            type={type}
            options={options}
          />
        ))}
        <br />
      </Center>
    </Frame>
  )
}

export default Page

const QuestionAnswerPair = ({ question, answer, type, options }) => {
  return (
    <Editorial.P attributes={{}}>
      <strong>{question}</strong>
      <br />
      {type === 'choice' ? (
        <ChoiceAnswer options={options} answer={answer} />
      ) : (
        answer
      )}
    </Editorial.P>
  )
}

const ChoiceAnswerOption = ({ option, checked }) => {
  const [colorScheme] = useColorContext()
  const Icon = checked ? IconRadioChecked : IconRadioUnchecked
  return (
    <span
      style={{
        marginRight: '2em',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      {...colorScheme.set('color', checked ? 'text' : 'textSoft')}
    >
      {!!Icon && <Icon style={{ marginRight: 7 }} />}
      {option}
    </span>
  )
}

const ChoiceAnswer = ({ options, answer }) => (
  <span>
    {options.map((option, i) => (
      <ChoiceAnswerOption key={i} option={option} checked={answer === option} />
    ))}
  </span>
)
