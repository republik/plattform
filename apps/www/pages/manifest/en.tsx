import { withRouter } from 'next/router'
import Link from 'next/link'
import {
  Editorial,
  BrandMark as R,
  NarrowContainer,
} from '@project-r/styleguide'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import { withDefaultSSR } from '../../lib/apollo/helpers'
import Frame from 'components/Frame'

const Page = ({ router }) => {
  const meta = {
    title: 'The Republik Manifest',
    description: 'Without journalism, no democracy.',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/manifest.png`,
    url: `${PUBLIC_BASE_URL}${router.pathname}`,
  }

  return (
    <Frame meta={meta} raw hasOverviewNav stickySecondaryNav={true}>
      <NarrowContainer
        style={{
          marginTop: '48px',
          marginBottom: '64px',
          display: 'flex',
          flexDirection: 'column',
          gap: '48px',
        }}
      >
        <div>
          <Editorial.Subhead>We are Republik</Editorial.Subhead>
          <Editorial.P>
            We are reclaiming journalism as profession and are creating a new
            business model for media companies that want to place their readers
            at the center. <Link href='/'>Our digital magazine Republik</Link>{' '}
            (in German) was launched in January 2018. Republik is reader owned
            and ad free.
          </Editorial.P>
          <Editorial.P>
            We are an open-source cooperative, and we share our knowledge,
            software and business insights with others who also want to create
            journalism projects that reinforce democracy.
          </Editorial.P>
        </div>
        <R />
        <div>
          <Editorial.Headline>
            Without journalism, no democracy.
          </Editorial.Headline>
          <Editorial.P>
            And without democracy, freedom disappears. If journalism dies, it is
            the end of an <Editorial.Emphasis>open society,</Editorial.Emphasis>{' '}
            of <Editorial.Emphasis>freedom of expression,</Editorial.Emphasis>{' '}
            of the right to{' '}
            <Editorial.Emphasis>
              choose between competing arguments. Freedom of the press
            </Editorial.Emphasis>{' '}
            was a battle cry of the{' '}
            <Editorial.Emphasis>liberal revolution</Editorial.Emphasis> — and it
            is the first victim of every dictatorship. Journalism was born out
            of <Editorial.Emphasis>the Enlightenment.</Editorial.Emphasis> Its
            purpose is to{' '}
            <Editorial.Emphasis>criticize the powers</Editorial.Emphasis> that
            be. That is why journalism is more than just a business to be run by
            corporate executives. Journalism is{' '}
            <Editorial.Emphasis>
              responsible only to the public
            </Editorial.Emphasis>{' '}
            — for in a democracy it is the same as in all of life: making{' '}
            <Editorial.Emphasis>sound decisions</Editorial.Emphasis> depends on
            getting <Editorial.Emphasis>sound information.</Editorial.Emphasis>{' '}
            Good journalism sends out teams to{' '}
            <Editorial.Emphasis>explore reality.</Editorial.Emphasis> The
            mission of journalists is to bring back the{' '}
            <Editorial.Emphasis>facts and context</Editorial.Emphasis> that
            citizens in a democracy need — and to report them as they are,{' '}
            <Editorial.Emphasis>independently,</Editorial.Emphasis>{' '}
            conscientiously and{' '}
            <Editorial.Emphasis>fearing no one</Editorial.Emphasis> but boredom.
            Journalism seeks <Editorial.Emphasis>clarity,</Editorial.Emphasis>{' '}
            waging a constant battle{' '}
            <Editorial.Emphasis>
              against the primordial fear of the new.
            </Editorial.Emphasis>{' '}
            Good journalism needs{' '}
            <Editorial.Emphasis>passion,</Editorial.Emphasis> skill and
            commitment. And it needs a thoughtful, curious and{' '}
            <Editorial.Emphasis>fearless public.</Editorial.Emphasis>{' '}
          </Editorial.P>
          <Editorial.Subhead>You!</Editorial.Subhead>
        </div>
      </NarrowContainer>
    </Frame>
  )
}

export default withDefaultSSR(withRouter(Page))
