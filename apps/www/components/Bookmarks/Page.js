import { useState, useMemo } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import Frame from '../Frame'
import { enforceMembership } from '../Auth/withMembership'
import { withTester } from '../Auth/checkRoles'
import DocumentListContainer from '../Feed/DocumentListContainer'
import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'

import {
  mediaQueries,
  fontStyles,
  Center,
  Interaction,
  A,
  plainButtonRule,
} from '@project-r/styleguide'
import { getCollectionItems, registerQueryVariables } from './queries'
import Link from 'next/link'
import { IconBookmarkBorder } from '@republik/icons'

const getConnection = (data) => data.me.collectionItems

const mergeConnection = (data, connection) => {
  return {
    ...data,
    me: {
      ...data.me,
      collectionItems: connection,
    },
  }
}

const bookmarkIcon = <IconBookmarkBorder size={22} key='icon' />

const Page = ({ t, me }) => {
  const showProgressTabs = me?.progressOptOut === null || me?.progressOptOut === false

  const [filter, setFilter] = useState('continue')
  const variables = useMemo(() => {
    if (showProgressTabs) {
      if (filter === 'read') {
        return {
          collections: ['progress', 'bookmarks'],
          progress: 'FINISHED',
        }
      }
      if (filter === 'continue') {
        return {
          collections: ['progress', 'bookmarks'],
          progress: 'UNFINISHED',
        }
      }
    }
    return {
      collections: ['bookmarks'],
    }
  }, [filter, showProgressTabs])
  registerQueryVariables(variables)

  return (
    <Frame
      meta={{
        title: t('nav/bookmarks'),
      }}
      raw
    >
      <Center style={{ marginBottom: 56 }}>
        <div {...styles.title}>{t('pages/bookmarks/title')}</div>
        {showProgressTabs ? (
          <div {...styles.filter}>
            <Interaction.P>
              {['continue', 'bookmarks', 'read'].map((key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  {...plainButtonRule}
                  {...styles.filterItem}
                  style={{
                    textDecoration: filter === key ? 'underline' : 'none',
                  }}
                >
                  {t(`pages/bookmarks/tab/${key}`)}
                </button>
              ))}
            </Interaction.P>
          </div>
        ) : null}

        <DocumentListContainer
          query={getCollectionItems}
          variables={variables}
          refetchOnUnmount
          getConnection={getConnection}
          mergeConnection={mergeConnection}
          mapNodes={(node) => node.document}
          feedProps={{ showHeader: false, showSubscribe: true }}
          placeholder={
            <Interaction.P style={{ marginBottom: 60 }}>
              {t.first.elements(
                [
                  showProgressTabs && `pages/bookmarks/placeholder/${filter}`,
                  'pages/bookmarks/placeholder',
                ].filter(Boolean),
                {
                  feedLink: (
                    <Link href='/feed' key='link' passHref legacyBehavior>
                      <A>{t('pages/bookmarks/placeholder/feedText')}</A>
                    </Link>
                  ),
                  bookmarkIcon,
                },
              )}
            </Interaction.P>
          }
          help={
            <Interaction.P {...styles.helpText}>
              {t.first(
                [
                  showProgressTabs && `pages/bookmarks/help/${filter}`,
                  'pages/bookmarks/help',
                ].filter(Boolean),
              )}
            </Interaction.P>
          }
        />
      </Center>
    </Frame>
  );
}

const styles = {
  title: css({
    ...fontStyles.sansSerifMedium58,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 80,
    [mediaQueries.onlyS]: {
      ...fontStyles.sansSerifMedium40,
      marginBottom: 50,
    },
  }),
  filter: css({
    display: 'flex',
    marginBottom: 16,
  }),
  filterItem: css({
    marginRight: 24,
    textAlign: 'left',
  }),
  helpText: css({
    ...fontStyles.sansSerifRegular16,
    marginBottom: 36,
  }),
}

export default compose(withT, withMe, enforceMembership(), withTester)(Page)
