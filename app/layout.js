export const metadata = {
  title: 'Perfect Motion Flights',
  description: 'Book flights smoothly via Duffel API',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a' }}>
        {children}
      </body>
    </html>
  )
}
