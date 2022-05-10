import { Interaction } from '@project-r/styleguide'

const { H2, H3, P } = Interaction

const Details = (props) => {
  const { card, user } = props

  const { party, councilOfStates, nationalCouncil, occupation, yearOfBirth } =
    card.payload

  const { listName, listPlaces } = nationalCouncil

  return (
    <>
      <H2>
        {user.name}, {party}
      </H2>
      <P>{[occupation, yearOfBirth].filter(Boolean).join(', ')}</P>
      <H3>
        {councilOfStates.candidacy && nationalCouncil.candidacy
          ? 'Stände- und Nationalratskandidatur'
          : councilOfStates.candidacy
          ? 'Ständeratskandidatur'
          : 'Nationalratskandidatur'}
      </H3>
      {listName && <P>Liste: «{listName}»</P>}
      {listPlaces && listPlaces.length && (
        <P>Listenplatz: {listPlaces.join(' & ')}</P>
      )}
    </>
  )
}

export default Details
