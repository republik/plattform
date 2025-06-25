import { notFound } from 'next/navigation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const chartMeta = await fetch(`https://api.datawrapper.de/v3/charts/${id}`, {
    headers: { authorization: `Bearer ${process.env.DATAWRAPPER_API_TOKEN}` },
  })

  if (!chartMeta.ok) {
    return notFound()
  }

  const metadata = await chartMeta.json()

  return Response.json(metadata)
}
