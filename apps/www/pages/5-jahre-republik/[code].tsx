import { Button, mediaQueries, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import Frame from '../../components/Frame'
import Stepper, { Step } from '../../components/Stepper/Stepper'
import { createGetServerSideProps } from '../../lib/apollo/helpers'
import AssetImage from '../../lib/images/AssetImage'

const styles = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: 850,
  }),
  main: css({
    flexGrow: 1,
    selfAlign: 'stretch',
  }),
}

const BottomPanel = ({
  steps,
  onAdvance,
}: {
  onAdvance: () => void
  steps: React.ReactNode
}) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...bottomPanelStyles.wrapper}
      {...colorScheme.set('backgroundColor', 'default')}
    >
      {steps}
      <Button onClick={() => onAdvance()}>Complete 2</Button>
    </div>
  )
}

const bottomPanelStyles = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    bottom: 0,
    margin: '0 -15px',
    padding: '0px 15px 15px 15px',
    width: '100vw',
    [mediaQueries.mUp]: {
      position: 'relative',
      margin: 0,
      padding: 0,
      width: '100%',
    },
  }),
}

const steps: Step[] = [
  {
    name: 'foo',
    content: ({ onAdvance, steps }) => (
      <>
        <h2>Foo</h2>
        <div {...styles.main}>
          <p>
            Aliqua veniam aliqua commodo laborum. Do non sit quis do
            exercitation pariatur eiusmod eu aliquip esse aliqua magna eu. Ut
            deserunt irure ex sint proident adipisicing ut anim ea sint.
            Cupidatat officia duis proident laborum. Non veniam velit occaecat
            culpa ut adipisicing amet esse adipisicing ipsum voluptate nulla ad
            duis quis. Duis incididunt ullamco elit cillum laborum eiusmod
            eiusmod. Elit nulla do sunt pariatur commodo Lorem et aliqua qui. Ad
            veniam pariatur non.
          </p>
          <AssetImage
            src='/static/climatelab/Klimaillu_Landingpage_5A47E1__Share.png'
            width={800}
            height={400}
          />
          <p>
            Aliqua veniam aliqua commodo laborum. Do non sit quis do
            exercitation pariatur eiusmod eu aliquip esse aliqua magna eu. Ut
            deserunt irure ex sint proident adipisicing ut anim ea sint.
            Cupidatat officia duis proident laborum. Non veniam velit occaecat
            culpa ut adipisicing amet esse adipisicing ipsum voluptate nulla ad
            duis quis. Duis incididunt ullamco elit cillum laborum eiusmod
            eiusmod. Elit nulla do sunt pariatur commodo Lorem et aliqua qui. Ad
            veniam pariatur non.
          </p>
        </div>
        <BottomPanel steps={steps} onAdvance={onAdvance} />
      </>
    ),
  },
  {
    name: 'bar',
    content: ({ onAdvance, steps }) => (
      <>
        <h2>Bar</h2>
        <div {...styles.main}>
          <p>
            Aliqua veniam aliqua commodo laborum. Do non sit quis do
            exercitation pariatur eiusmod eu aliquip esse aliqua magna eu. Ut
            deserunt irure ex sint proident adipisicing ut anim ea sint.
            Cupidatat officia duis proident laborum. Non veniam velit occaecat
            culpa ut adipisicing amet esse adipisicing ipsum voluptate nulla ad
            duis quis. Duis incididunt ullamco elit cillum laborum eiusmod
            eiusmod. Elit nulla do sunt pariatur commodo Lorem et aliqua qui. Ad
            veniam pariatur non.
          </p>
          <AssetImage
            src='/static/climatelab/richardson.jpg'
            width={800}
            height={400}
          />
          <p>
            Aliqua veniam aliqua commodo laborum. Do non sit quis do
            exercitation pariatur eiusmod eu aliquip esse aliqua magna eu. Ut
            deserunt irure ex sint proident adipisicing ut anim ea sint.
            Cupidatat officia duis proident laborum. Non veniam velit occaecat
            culpa ut adipisicing amet esse adipisicing ipsum voluptate nulla ad
            duis quis. Duis incididunt ullamco elit cillum laborum eiusmod
            eiusmod. Elit nulla do sunt pariatur commodo Lorem et aliqua qui. Ad
            veniam pariatur non.
          </p>
        </div>
        <BottomPanel steps={steps} onAdvance={onAdvance} />
      </>
    ),
  },
  {
    name: 'baz',
    content: ({ onAdvance, steps }) => (
      <>
        <h2>Baz</h2>
        <div {...styles.main}>
          <p>
            Aliqua veniam aliqua commodo laborum. Do non sit quis do
            exercitation pariatur eiusmod eu aliquip esse aliqua magna eu. Ut
            deserunt irure ex sint proident adipisicing ut anim ea sint.
            Cupidatat officia duis proident laborum. Non veniam velit occaecat
            culpa ut adipisicing amet esse adipisicing ipsum voluptate nulla ad
            duis quis. Duis incididunt ullamco elit cillum laborum eiusmod
            eiusmod. Elit nulla do sunt pariatur commodo Lorem et aliqua qui. Ad
            veniam pariatur non.
          </p>
          <p>
            Aliqua veniam aliqua commodo laborum. Do non sit quis do
            exercitation pariatur eiusmod eu aliquip esse aliqua magna eu. Ut
            deserunt irure ex sint proident adipisicing ut anim ea sint.
            Cupidatat officia duis proident laborum. Non veniam velit occaecat
            culpa ut adipisicing amet esse adipisicing ipsum voluptate nulla ad
            duis quis. Duis incididunt ullamco elit cillum laborum eiusmod
            eiusmod. Elit nulla do sunt pariatur commodo Lorem et aliqua qui. Ad
            veniam pariatur non.
          </p>
        </div>
        <BottomPanel steps={steps} onAdvance={onAdvance} />
      </>
    ),
  },
]

const InviteReceiverPage = () => {
  const router = useRouter()
  // TODO: if user is logged in and has abo, show info text that the user already has an abo
  // TODO: if user has monthly abo, also show info text that not available if already subscirbed

  // TODO: if not logged in or probelesen show stepper

  const handleComplete = () => {
    // TODO
    // based on the selected price either choose the
    // package that is associated with non coop membership.
    // else choose the package that is associated with coop membership
    // additionally attach ?utm_campaign received from the server based on the invite-code
    const res = confirm('Zum checkout')
    if (res) {
      router.push({
        pathname: '/angebote',
        query: {
          package: 'ABO',
          utm_campaign: 'TODO_5-jahre-republik',
        },
      })
    }
  }

  return (
    <Frame pageColorSchemeKey='dark'>
      <Stepper
        steps={steps}
        onComplete={handleComplete}
        customStepperUIPlacement
        contentWrapperElement={({ children }) => (
          <div {...styles.wrapper}>{children}</div>
        )}
      />
    </Frame>
  )
}

export default InviteReceiverPage

export const getServerSideProps = createGetServerSideProps(
  async ({
    client,
    user,
    ctx: {
      params: { code },
    },
  }) => {
    console.debug('SSR 5-year-republik for code: ' + code)

    // Step 1:
    // TODO: Get access-token associated with the code from api
    // TODO: else error page

    // Step 2:
    // TODO: If access-token is valid, get inviter-user from api

    // Step 3:
    // TODO: If inviter-user = request-user, redirect to '/verstaerkung-holen'
    if (code === 'SELF') {
      return {
        redirect: {
          destination: '/verstaerkung-holen',
          permanent: false,
        },
      }
    }

    return {
      props: {},
    }
  },
)
