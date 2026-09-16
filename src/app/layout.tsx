import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zyro — Restaurant Digital Presence',
  description: 'Create a professional digital page for your restaurant. One QR code, all your links.',
  keywords: ['restaurant', 'qr code', 'google review', 'digital presence'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
