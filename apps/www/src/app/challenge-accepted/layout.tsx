export default function Layout(props: {
  children: React.ReactNode
  overlay: React.ReactNode
}) {
  return (
    <>
      {props.children}
      {props.overlay}
    </>
  )
}
