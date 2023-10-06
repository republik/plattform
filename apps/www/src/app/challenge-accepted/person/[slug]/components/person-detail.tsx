import CollectionRenderer from '@app/components/collection-render'
import Container from '@app/components/container'
import type { PersonDetailQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'
import Image from 'next/image'
import { StructuredText } from 'react-datocms'

type PersonDetailProps = {
  person: PersonDetailQuery['person']
  isMember?: boolean
}

export function PersonDetail({ person, isMember = false }: PersonDetailProps) {
  // Approximate the ratio of character width to a height of 100
  const funkyCalculatedViewboxWidth = person.name.length * 32
  // Approximate the space the rotated text needs
  const funkyCalculatedViewboxHeight = person.name.length * 4.5 + 100

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '2',
        mb: '16',
        alignItems: 'center',
      })}
    >
      {/* It's impossible to fit text size to container width (without measuring in the DOM), therefore we use some funky calculations based on the name to approximate a viewbox that fits relatively close to the rendered text. Then the SVG is simply scaled with CSS to 100% of its parent's width */}
      <svg
        className={css({ display: 'block', width: 'full', mt: '8' })}
        viewBox={`0 0 ${funkyCalculatedViewboxWidth} ${funkyCalculatedViewboxHeight}`}
      >
        <text
          x={0}
          y={0}
          transform={`translate(${funkyCalculatedViewboxWidth / 2}, ${
            funkyCalculatedViewboxHeight / 2
          }) rotate(-9)`}
          className={css({
            textStyle: 'personTitle',
          })}
          textAnchor='middle'
          dy='.35em'
        >
          {person.name}
        </text>
      </svg>
      {person.portrait && (
        <Image
          alt={person.name}
          src={person.portrait.url}
          width={500}
          height={500}
        />
      )}

      <Container>
        <StructuredText data={person.bio.value} />
        <h2 className={css({ textStyle: 'h2Sans', my: '6' })}>Inhalte</h2>
        <CollectionRenderer items={person.items} isMember={isMember} />
      </Container>
    </div>
  )
}
