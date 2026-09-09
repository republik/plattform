import {
  A,
  fontFamilies,
  inQuotes,
  Interaction,
  mediaQueries,
  P as SerifP,
  useColorContext,
  VideoPlayer,
} from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'

const { H3, P } = Interaction

const styles = {
  detail: css({
    width: '100%',
    padding: '30px 0',
    [mediaQueries.mUp]: {
      padding: '30px 45px',
    },
  }),
  detailTitle: css({
    lineHeight: '20px',
  }),
  detailRole: css({
    fontSize: 17,
    fontFamily: fontFamilies.sansSerifRegular,
  }),
  number: css({
    marginBottom: 20,
    fontFamily: fontFamilies.sansSerifMedium,
  }),
}

const Detail = ({
  t,
  data: {
    id,
    slug,
    name,
    statement,
    portrait,
    sequenceNumber,
    video,
    updatedAt,
  },
}) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.detail}>
      <div
        style={
          video
            ? {
                maxWidth: 400,
                marginLeft: 'auto',
                marginRight: 'auto',
              }
            : {}
        }
      >
        <H3 {...styles.detailTitle} {...colorScheme.set('color', 'text')}>
          {slug ? (
            <Link href={`/~${slug}`} passHref legacyBehavior>
              <A style={{ color: 'inherit' }}>{name}</A>
            </Link>
          ) : (
            <span>{name}</span>
          )}
        </H3>
        {video ? (
          <div
            style={{
              marginBottom: 20,
              marginTop: 10,
            }}
          >
            <VideoPlayer
              key={id}
              src={{ ...video, poster: portrait }}
              autoPlay
            />
          </div>
        ) : statement ? (
          <SerifP {...colorScheme.set('color', 'text')}>
            {inQuotes(statement)}
          </SerifP>
        ) : (
          <br />
        )}
        {!!sequenceNumber && (
          <P {...styles.number} {...colorScheme.set('color', 'text')}>
            {t('memberships/sequenceNumber/label', {
              sequenceNumber,
            })}
          </P>
        )}
      </div>
    </div>
  )
}

export default Detail
