'use client'

import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Check } from 'lucide-react'
import { useState } from 'react'

export default function QRCodeGenerator({ slug, restaurantName }: { slug: string, restaurantName: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  const url = `${siteUrl}/r/${slug}`
  const [copied, setCopied] = useState(false)

  const downloadQR = () => {
    const canvas = document.getElementById(`qr-code-${slug}`) as HTMLCanvasElement
    if (!canvas) return
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `${slug}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <QRCodeCanvas 
          id={`qr-code-${slug}`}
          value={url}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      
      <div className="text-sm font-medium text-gray-700">{restaurantName}</div>
      
      <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg text-sm w-full max-w-sm">
        <span className="truncate flex-1 text-gray-600">{url}</span>
        <Button size="icon" variant="ghost" onClick={copyUrl} className="h-8 w-8">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <Button onClick={downloadQR} className="w-full max-w-sm">
        <Download className="w-4 h-4 mr-2" /> Download QR Code
      </Button>
    </div>
  )
}
