export default async function ConfirmDialog({ searchParams }) {
  return (
    <form action='/auth/confirm' method='POST'>
      <pre>{JSON.stringify(searchParams, null, 2)}</pre>

      {Object.entries(searchParams).map(([k, v]) => {
        return <input key={k} name={k} type='text' value={v as string} />
      })}

      <button type='submit'>Bestätigen</button>
      <button type='submit'>Ablehnen</button>
    </form>
  )
}
