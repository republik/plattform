import { css } from 'glamor'

import {
  Meta,
  useColorContext,
  mediaQueries,
  FigureImage,
} from '@project-r/styleguide'
import SectionTitle from './Common/SectionTitle'
import SectionContainer from './Common/SectionContainer'
import { MarketingLandingPageCmsQuery } from '#graphql/cms/__generated__/gql/graphql'

type FormatsProps = {
  formats: MarketingLandingPageCmsQuery['marketingLandingPage']['formats']
  title: MarketingLandingPageCmsQuery['marketingLandingPage']['sectionFormatsTitle']
  description: MarketingLandingPageCmsQuery['marketingLandingPage']['sectionFormatsDescription']
}

const Formats = ({ formats, title, description }: FormatsProps) => {
  const [colorScheme] = useColorContext()
  return (
    <SectionContainer maxWidth={720}>
      <SectionTitle title={title} lead={description} />
      {formats.map((format) => (
        <div
          key={format.title}
          {...styles.formatContainer}
          {...colorScheme.set('borderColor', 'divider')}
        >
          <div {...styles.image}>
            <FigureImage
              src={format.imageBright.responsiveImage.src}
              dark={{ src: format.imageDark.responsiveImage.src }}
            />
          </div>
          <div {...styles.description}>
            <Meta.Subhead
              style={{ marginTop: 0 }}
              {...colorScheme.set('color', format.color, 'format')}
            >
              {format.title}
            </Meta.Subhead>
            <Meta.P>{format.description}</Meta.P>
          </div>
        </div>
      ))}
    </SectionContainer>
  )
}

const styles = {
  formatContainer: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'top',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 28,
    marginBottom: 32,
    '&:nth-child(2)': {
      borderTop: 'none',
    },
  }),
  description: css({
    flex: 1,
  }),
  image: css({
    width: 80,
    height: 80,
    marginRight: 16,
    objectFit: 'cover',
    [mediaQueries.mUp]: {
      marginRight: 36,
    },
  }),
}

export default Formats
