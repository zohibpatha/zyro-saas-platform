'use client'

import { useState } from 'react'
import ImageUpload from './image-upload'
import { addFoodPhoto, deleteFoodPhoto } from '@/actions/restaurant'
import type { FoodPhoto } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function FoodPhotosManager({ restaurantId, initialPhotos }: { restaurantId: string, initialPhotos: FoodPhoto[] }) {
  const [photos, setPhotos] = useState<FoodPhoto[]>(initialPhotos)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleUpload = async (url: string) => {
    if (!url) return
    const result = await addFoodPhoto(restaurantId, url)
    if (result.photo) {
      setPhotos([...photos, result.photo])
    }
  }

  const handleDelete = async (photoId: string) => {
    setIsDeleting(photoId)
    await deleteFoodPhoto(photoId, restaurantId)
    setPhotos(photos.filter(p => p.id !== photoId))
    setIsDeleting(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50/50">
            <Image 
              src={photo.image_url} 
              alt="Food photo" 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <Button 
                variant="destructive" 
                size="icon" 
                className="bg-red-500 hover:bg-red-600 text-white shadow-md border-0 w-9 h-9 rounded-full"
                onClick={() => handleDelete(photo.id)}
                disabled={isDeleting === photo.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="aspect-square rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 transition-colors flex flex-col items-center justify-center p-4">
          <ImageUpload onUpload={handleUpload} restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  )
}
