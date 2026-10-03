import './globals.css';

export const metadata = {
  title: 'Perfect Motion Flights',
  description: 'Book flights smoothly via Duffel API',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
