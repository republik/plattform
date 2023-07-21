import NextLink from 'next/link'
import { useRouter } from 'next/router'

import {
  Interaction,
  IconButton,
  Center,
  Figure,
  FigureImage,
  useHeaderHeight,
  useColorContext,
  NarrowContainer,
  FigureCaption,
  ColorContextProvider,
  FigureByline,
  Editorial,
} from '@project-r/styleguide'

import { IconRadioChecked, IconRadioUnchecked } from '@republik/icons'

import { PUBLIC_BASE_URL, ASSETS_SERVER_BASE_URL } from '../../lib/constants'

// import { useMe } from '../../../lib/context/MeContext'
import { useTranslation } from '../../lib/withT'

import Frame from '../Frame'
import Meta from '../Frame/Meta'

import { ShareImageSplit } from '../Questionnaire/Submissions/ShareImageSplit'
import { styles as submissionStyles } from '../Questionnaire/Submissions/Submission'

import HeaderShare from './HeaderShare'

import {
  // EDIT_QUESTIONNAIRE_PATH,
  OVERVIEW_QUESTIONNAIRE_PATH,
  QUESTIONNAIRE_BG_COLOR,
  // QUESTIONNAIRE_SLUG,
  QUESTIONNAIRE_SQUARE_IMG_URL,
  PERSON_SHARE_TEXT,
  ILLU_SHARE,
} from './config'
import { IconChevronLeft } from '@republik/icons'

const Page = ({ responses, authorData }) => {
  const { t } = useTranslation()
  const [headerHeight] = useHeaderHeight()
  const [colorScheme] = useColorContext()

  const router = useRouter()
  const {
    query: { id, image },
  } = router

  // const { me } = useMe()

  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('image', true)
  const shareImageUrl = shareImageUrlObj.toString()

  if (image) {
    return (
      <ShareImageSplit
        user={authorData.name}
        img={ILLU_SHARE}
        bgColor={QUESTIONNAIRE_BG_COLOR}
        personShareText={PERSON_SHARE_TEXT}
      />
    )
  }

  // const {
  //   questionnaire: { questions, results },
  // } = data
  // const submission = results.nodes[0]
  // if (!submission) {
  //   if (process.browser) {
  //     router.replace({ pathname: OVERVIEW_QUESTIONNAIRE_PATH })
  //   }
  //   return null
  // }

  const meta = {
    url,
    title: 'Politikerfragebogen 2023',
    description: t('Climatelab/Questionnaire/description', {
      name: authorData.name,
    }),
    image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
      shareImageUrl,
    )}`,
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
                <FigureByline>Cristina Spanò</FigureByline>
              </FigureCaption>
            </Figure>
            <NarrowContainer style={{ padding: '20px 0' }}>
              <Interaction.Headline>
                {t('Climatelab/Questionnaire/Person/title', {
                  name: authorData.name,
                })}
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
            <NextLink href={OVERVIEW_QUESTIONNAIRE_PATH} passHref>
              <IconButton
                size={24}
                label='Zur Übersicht'
                labelShort='Zur Übersicht'
                Icon={IconChevronLeft}
              />
            </NextLink>
          </div>
          <HeaderShare meta={meta} />
          {/* {isOwnQuestionnaire && (
            <IconButton
              size={24}
              label='Bearbeiten'
              labelShort=''
              Icon={IconEdit}
              href={EDIT_QUESTIONNAIRE_PATH}
            />
          )} */}
        </div>

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
