'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/actions/restaurant'
import { uploadImagePublic } from '@/actions/manage'
import Image from 'next/image'
import { Loader2, UploadCloud, X } from 'lucide-react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  currentUrl?: string
  restaurantId?: string
  isClientManage?: boolean
  slug?: string
  acceptPdf?: boolean
}

export default function ImageUpload({ onUpload, currentUrl, restaurantId, isClientManage, slug, acceptPdf }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/') && (!acceptPdf || file.type !== 'application/pdf')) {
      setError(acceptPdf ? 'Please upload an image or PDF file' : 'Please upload an image file')
      return
    }

    setIsUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    if (restaurantId) {
      formData.append('restaurantId', restaurantId)
    }

    try {
      let result
      if (isClientManage) {
        if (slug) formData.append('slug', slug)
        result = await uploadImagePublic(formData)
      } else {
        result = await uploadImage(formData)
      }
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        onUpload(result.url)
      }
    } catch (err) {
      setError('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
      {currentUrl ? (
        <div className="relative aspect-video w-full max-w-sm mx-auto rounded overflow-hidden group bg-slate-100 flex items-center justify-center">
          {currentUrl.endsWith('.pdf') ? (
            <div className="flex flex-col items-center justify-center p-4">
              <span className="font-bold text-slate-500 mb-2">PDF Document</span>
              <a href={currentUrl} target="_blank" className="text-blue-500 underline text-sm relative z-20">View PDF</a>
            </div>
          ) : (
            <Image 
              src={currentUrl} 
              alt="Uploaded file" 
              fill 
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <Button type="button" variant="destructive" size="sm" onClick={() => onUpload('')}>
              <X className="w-4 h-4 mr-2" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
          ) : (
            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
          )}
          <div className="text-sm text-gray-600">
            {isUploading ? 'Uploading...' : 'Click or drag image to upload'}
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        accept={acceptPdf ? "image/*,application/pdf" : "image/*"}
        onChange={handleFileChange}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-0"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
