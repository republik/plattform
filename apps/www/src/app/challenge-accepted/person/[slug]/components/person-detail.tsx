import CollectionRenderer from '@app/app/challenge-accepted/components/collection-render'
import Container from '@app/components/container'
import { Share } from '@app/components/share/share'
import type { PersonDetailQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'
import { hstack, vstack } from '@app/styled-system/patterns'
import { IconShare } from '@republik/icons'
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
      className={vstack({
        gap: '16-32',
        alignItems: 'center',
      })}
    >
      <div
        className={css({
          position: 'relative',
          width: 'full',
        })}
      >
        {/* It's impossible to fit text size to container width (without measuring in the DOM), therefore we use some funky calculations based on the name to approximate a viewbox that fits relatively close to the rendered text. Then the SVG is simply scaled with CSS to 100% of its parent's width */}
        <svg
          className={css({
            display: 'block',
            width: 'full',
            mb: '32',
            fill: 'text',
            userSelect: 'none',
          })}
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
          <div
            className={css({
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translatex(-50%)',
            })}
          >
            <Image
              alt={person.name}
              src={person.portrait.url}
              width={400}
              height={400}
            />
          </div>
        )}
      </div>

      <Container>
        <div className={vstack({ gap: '16-32' })}>
          {person?.catchPhrase && (
            <h2
              className={css({
                fontWeight: 'bold',
                fontSize: '37px',
                lineHeight: '44px',
                marginBottom: '18px',
              })}
            >
              «{person.catchPhrase}»
            </h2>
          )}
          <div
            className={css({
              color: 'text',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',

              textStyle: 'paragraph',

              '& ul > li': {
                listStyleType: 'none',
                pl: '6',
                position: 'relative',
                '&::before': {
                  content: '"–"',
                  position: 'absolute',
                  left: '0',
                },
              },
              '& ol': { listStyleType: 'decimal', pl: '6' },
              '& h2, & h3, & h4, & h5, & h6': {
                fontWeight: 'bold',
              },
            })}
          >
            <StructuredText data={person.bio.value} />
          </div>
          <Share
            title={`Challenge Accepted: ${person.name} | Republik`}
            url={`${process.env.NEXT_PUBLIC_BASE_URL}/challenge-accepted/person/${person.slug}`}
            emailSubject={`Challenge Accepted: ${person.name} | Republik`}
          >
            <div
              className={hstack({
                gap: '2',
                color: 'text',
                textStyle: 'sansSerifBold',
                fontSize: 'm',
                cursor: 'pointer',
                _hover: {
                  color: 'contrast',
                },
              })}
            >
              <IconShare size={20} /> Teilen
            </div>
          </Share>
          {person.items.length > 0 ? (
            <section>
              <h2
                className={css({
                  textStyle: 'h1Sans',
                  fontWeight: 'bold',
                  mb: '6',
                })}
              >
                Von und mit {person.name}
              </h2>
              <CollectionRenderer items={person.items} isMember={isMember} />
            </section>
          ) : (
            <div className={css({ mb: '16-32' })}></div>
          )}
        </div>
      </Container>
    </div>
  )
}
