import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { css } from 'glamor'

import {
  mediaQueries,
  fontStyles,
  Loader,
  useColorContext,
  convertStyleToRem,
  Label,
  Editorial,
  createFormatter,
} from '@project-r/styleguide'

import { gql } from '@apollo/client'
import { countFormat, swissNumbers } from '../../lib/utils/format'

const styles = {
  container: css({
    marginTop: '20px',
  }),
  primaryNumberContainer: css({
    marginBottom: -20,
    [mediaQueries.mUp]: {
      marginBottom: 0,
    },
  }),
  primaryNumber: css({
    display: 'block',
    marginBottom: -15,
    fontSize: 90,
    ...fontStyles.serifTitle,
    lineHeight: 1,
    [mediaQueries.mUp]: {
      fontSize: 120,
      marginBottom: -20,
    },
  }),
  secondaryNumbersWrapper: css({
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '20px',
  }),
  secondaryNumbersContainer: css({
    marginTop: '20px',
    flexGrow: 1,
    [mediaQueries.mUp]: {
      flex: '1 1 0px',
    },
  }),
  secondaryNumber: css({
    display: 'block',
    fontSize: 40,
    marginBottom: -5,
    ...fontStyles.serifTitle,
    lineHeight: 1,
    [mediaQueries.mUp]: {
      fontSize: 60,
    },
  }),
  description: css({
    ...convertStyleToRem(fontStyles.sansSerifRegular18),
  }),
  footnoteContainer: css({
    marginTop: 20,
  }),
}

const query = gql`
  query getRoleCount {
    roleStats(role: "climate") {
      count
    }
  }
`

const Counter = ({
  data,
  demographics,
  translations = [],
  linkHref,
  linkText,
  showDemographics,
  textAlignment = 'left',
}) => {
  const [colorScheme] = useColorContext()
  const t = createFormatter(translations)
  return (
    <Loader
      loading={data.loading}
      error={data.error}
      render={() => {
        const numberClimateUsers = data.roleStats.count || 0

        return (
          <div {...styles.container} style={{ textAlign: textAlignment }}>
            <div {...styles.primaryNumberContainer}>
              <span {...styles.primaryNumber}>
                {countFormat(numberClimateUsers)}
              </span>
              <span
                {...colorScheme.set('color', 'textSoft')}
                {...styles.description}
              >
                {t('primaryNumber')}
              </span>
            </div>
            {showDemographics && (
              <>
                <div {...styles.secondaryNumbersWrapper}>
                  {demographics.map((d, i) => (
                    <div key={i} {...styles.secondaryNumbersContainer}>
                      <span {...styles.secondaryNumber}>
                        {swissNumbers.format('.0%')(d.number)}
                      </span>
                      <span
                        {...colorScheme.set('color', 'textSoft')}
                        {...styles.description}
                      >
                        {d.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div {...styles.footnoteContainer}>
                  <Label>
                    {t.elements('footnote', {
                      link: (
                        <Link href={linkHref} text={linkText} key={linkHref} />
                      ),
                    })}
                  </Label>
                </div>
              </>
            )}
          </div>
        )
      }}
    />
  )
}

export default compose(
  graphql(query, {
    options: ({ pollInterval }) => ({
      pollInterval: pollInterval || 0,
    }),
  }),
)(Counter)

const Link = (props) => {
  const { href, text } = props
  return <Editorial.A href={href}>{text}</Editorial.A>
}
