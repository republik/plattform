import { Fragment } from 'react'
import { css } from 'glamor'

import {
  Button,
  Loader,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'

import withT from '../../lib/withT'

export const SECTION_SPACE = 30
export const SECTION_SPACE_MOBILE = 20

const styles = {
  p: css({
    marginBottom: 20,
  }),
  section: css({
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: SECTION_SPACE_MOBILE * 0.6,
    paddingBottom: SECTION_SPACE_MOBILE * 0.6,
    [mediaQueries.mUp]: {
      paddingTop: SECTION_SPACE * 0.6,
      paddingBottom: SECTION_SPACE * 0.6,
    },
    '&:last-child': css({
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
    }),
  }),
  heading: css({
    fontSize: SECTION_SPACE_MOBILE,
    [mediaQueries.mUp]: {
      fontSize: SECTION_SPACE,
    },
  }),
  content: css({
    marginBottom: 20,
    '&:last-child': css({
      paddingBottom: SECTION_SPACE_MOBILE * 0.6,
      [mediaQueries.mUp]: {
        paddingBottom: SECTION_SPACE * 0.6,
      },
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
    }),
  }),
  contentFooter: css({
    marginTop: 20,
  }),
  doneIcon: css({
    height: SECTION_SPACE_MOBILE * 1.1,
    width: SECTION_SPACE_MOBILE * 1.1,
    alignSelf: 'flex-end',
    [mediaQueries.mUp]: {
      height: SECTION_SPACE * 1.1,
      width: SECTION_SPACE * 1.1,
    },
  }),
}

const Section = (props) => {
  const [colorScheme] = useColorContext()
  const onExpand = (e) => {
    e.preventDefault()
    props.onExpand(props)
  }

  const onContinue = (e) => {
    e.preventDefault()
    props.onContinue(props)
  }

  const {
    heading,
    isLoading,
    isTicked,
    isVisited,
    isExpanded,
    error,
    children,
    forwardedRef,
    showContinue = true,
    t,
  } = props

  return (
    <Fragment>
      <div
        ref={forwardedRef}
        {...styles.section}
        {...colorScheme.set('borderColor', 'divider')}
        onClick={onExpand}
      >
        <div {...styles.heading}>{heading}</div>
        {(isTicked || isVisited) && (
          <IconDone
            {...styles.doneIcon}
            {...colorScheme.set('color', 'primary')}
          />
        )}
      </div>
      {isExpanded && (
        <div {...styles.content}>
          {(isLoading || error) && <Loader loading={isLoading} error={error} />}
          {!isLoading && !error && children}
          <div {...styles.contentFooter}>
            {showContinue && (
              <Button primary onClick={onContinue}>
                {t('Onboarding/Section/button/continue')}
              </Button>
            )}
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default withT(Section)
