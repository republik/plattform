import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { css } from '@app/styled-system/css'

export default async function Layout(props: { children: React.ReactNode }) {
  return (
    <div data-page-theme='campaign-2024' data-theme-inverted>
      <PageLayout showHeader={false} showFooter={false}>
        <Container>
          <div
            className={css({
              minHeight: '100dvh',
              display: 'flex',
              background: 'pageBackground',
              color: 'text',
            })}
          >
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '8',
                // py: '8-16',
                fontSize: 'xl',
                position: 'relative',
                minHeight: { md: '50rem', base: '100dvh' },
                // maxHeight: 800,
                justifyContent: 'stretch',
                margin: 'auto',
                // margin: 'auto',
              })}
            >
              {props.children}
            </div>
          </div>
        </Container>
      </PageLayout>
    </div>
  )
}
