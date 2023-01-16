import { css } from 'glamor'
import { AutoTextSize } from 'auto-text-size'

import {
  fontFamilies,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import AssetImage from '../../../lib/images/AssetImage'
import { useTranslation } from '../../../lib/withT'

import { postcardCredits } from '../config'

const styles = {
  postcard: css({
    position: 'relative',
    backgroundColor: '#F9FBFF',
    margin: '0 0 20px 0',
    width: '100%',
    height: '100%',
    aspectRatio: '16 / 9',
    display: 'flex',
    padding: '10px',
    border: 'solid 2px f9f5ec',
    borderRadius: '2px',
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: '12px',
    lineHeight: '1.2',
    color: '#282828',
    [mediaQueries.mUp]: {
      padding: '20px',
      fontSize: '16px',
      lineHeight: '1.5',
    },
  }),
  textArea: css({
    display: 'flex',
    flexWrap: 'wrap',
    flexFlow: 'column',
    maxHeight: '100%',
    wordBreak: 'normal',
    overflowWrap: 'break-word',
    width: '67%',
    borderRight: 'solid 1px #DADDDC',
    marginBottom: '10px',
    paddingRight: '10px',
    [mediaQueries.mUp]: {
      paddingRight: '20px',
    },
    ':first-child': {
      flexBasis: '80%',
    },
  }),
  credit: css({
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingBottom: '5px',
    paddingRight: '10px',
    fontSize: '0.5rem',
    [mediaQueries.mUp]: {
      fontSize: '0.6rem',
    },
  }),
  rightSide: css({
    display: 'flex',
    flexDirection: 'column',
    width: '33%',
    paddingLeft: '10px',
    justifyContent: 'sprace-between',
    [mediaQueries.mUp]: {
      paddingLeft: '20px',
    },
  }),
  image: css({
    borderImage: 'url(/static/climatelab/border-image.png) 32 round',
    borderWidth: '8px',
    borderStyle: 'solid',
    '> span': { display: 'block !important' },
  }),
  adressBlock: css({
    borderBottom: 'solid 1px #DADDDC',
    paddingBottom: '5px',
    lineHeight: '1.1',
  }),
  adressBlockContainer: css({
    width: '100%',
    paddingBottom: '3px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-around',
  }),
}

export const PostcardPreview = (props) => {
  const { t } = useTranslation()
  const { postcard } = props
  const [colorScheme] = useColorContext()

  if (!postcard) return null

  const { text, imageUrl, imageSelection, author } = postcard

  return (
    <div
      {...styles.postcard}
      {...colorScheme.set('boxShadow', 'imageChoiceShadow')}
    >
      <div {...styles.credit}>
        {' '}
        {t('Climatelab/Postcard/PostcardPreview/credit', {
          credit: postcardCredits[imageSelection] || ' ...',
        })}
      </div>

      <div {...styles.textArea}>
        <AutoTextSize mode='box'>{text}</AutoTextSize>

        <AutoTextSize mode='oneline' maxFontSizePx={16}>
          {author && author.name}
        </AutoTextSize>
      </div>

      <div {...styles.rightSide}>
        <PoststampComponent imageUrl={imageUrl} />
        <div {...styles.adressBlockContainer}>
          <div {...styles.adressBlock}></div>
          <div {...styles.adressBlock} />
          <div {...styles.adressBlock} />
        </div>
      </div>
    </div>
  )
}

const PoststampComponent = ({ imageUrl }) => {
  return imageUrl ? (
    <div {...styles.image}>
      <AssetImage width={'200'} height={'133'} src={imageUrl} />
    </div>
  ) : (
    <div
      {...styles.image}
      style={{ height: '4rem', aspectRatio: '4 / 3' }}
    ></div>
  )
}
