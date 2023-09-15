export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='de'>
      <body>ROOTLAYOUT{children}</body>
    </html>
  )
}
