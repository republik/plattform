import React from 'react'
import Link from 'next/link'

import { css } from 'glamor'

const styles = {
  prepub: css({
    position: 'absolute',
    background: '#E9A733',
    width: '100%',
    padding: '2px 5px',
    color: '#ffffff',
  }),
  card: css({
    backgroundColor: 'rgb(242, 242, 242)',
  }),
  cardContent: css({
    padding: '5px 10px 10px',
  }),
}

const Card = ({ prepublication, ...props }) => (
  <div style={{ position: 'relative', height: '100%' }}>
    {prepublication && <div {...styles.prepub}>Editoren-Vorschau</div>}
    <Link
      href={`/newsletter${props.path}`}
      style={{
        textDecoration: 'none',
      }}
    >
      <div {...styles.card}>
        <img src={props.image} alt={props.title} />
        <div {...styles.cardContent}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              lineHeight: '1.2em',
              margin: '0px 0px 0.2em',
            }}
          >
            {props.title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 18,
            }}
          >
            {new Date(props.publishDate).toLocaleDateString('de-CH', {
              dateStyle: 'long',
            })}
          </p>
        </div>
      </div>
    </Link>
  </div>
)

export default Card
