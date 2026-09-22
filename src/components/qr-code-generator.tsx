'use client'

import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function QRCodeGenerator({ slug, restaurantName }: { slug: string, restaurantName: string }) {
  const [siteUrl, setSiteUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // ALWAYS use the actual origin in the browser to ensure the QR code matches where they are currently deployed.
    // If they are on Vercel, it uses the Vercel URL.
    setSiteUrl(window.location.origin)
  }, [])

  // Avoid rendering the wrong QR code before useEffect runs
  if (!siteUrl) {
    return <div className="animate-pulse bg-slate-100 rounded-2xl w-48 h-48"></div>
  }

  const url = `${siteUrl}/r/${slug}`

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
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
        <QRCodeCanvas 
          id={`qr-code-${slug}`}
          value={url}
          size={512}
          style={{ width: '100%', maxWidth: '200px', height: 'auto' }}
          level="M"
          includeMargin={true}
        />
      </div>
      
      <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 p-1.5 rounded-lg text-sm w-full">
        <span className="truncate flex-1 text-gray-500 text-xs px-2">{url}</span>
        <Button size="icon" variant="ghost" onClick={copyUrl} className="h-7 w-7 bg-white shadow-sm border border-gray-200 hover:bg-gray-50">
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-600" />}
        </Button>
      </div>

      <Button onClick={downloadQR} className="w-full h-9 bg-black text-white hover:bg-gray-800 shadow-sm text-sm transition-all rounded-md">
        <Download className="w-4 h-4 mr-2" /> Download QR
      </Button>
    </div>
  )
}
