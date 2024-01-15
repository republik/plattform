export default function Page({ params }) {
  return (
    <div>
      Hey, mach mit! Du wurdest eingeladen von <strong>{params.code}</strong>
    </div>
  )
}
