'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleRestaurant, deleteRestaurant } from '@/actions/restaurant'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import QRCodeGenerator from '@/components/qr-code-generator'
import type { Restaurant } from '@/lib/types'
import { ExternalLink, Edit, QrCode, Power, Trash2 } from 'lucide-react'

export default function AdminActions({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    await toggleRestaurant(restaurant.id)
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this restaurant? This cannot be undone.')) return
    setIsLoading(true)
    await deleteRestaurant(restaurant.id)
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/edit/${restaurant.id}`}>
        <Button variant="outline" size="icon" title="Edit">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      
      <Button 
        variant={restaurant.is_active ? 'destructive' : 'default'} 
        size="icon" 
        onClick={handleToggle}
        disabled={isLoading}
        title={restaurant.is_active ? 'Deactivate' : 'Activate'}
      >
        <Power className="h-4 w-4" />
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="QR Code">
            <QrCode className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{restaurant.name} QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-6">
            <QRCodeGenerator slug={restaurant.slug} restaurantName={restaurant.name} />
          </div>
        </DialogContent>
      </Dialog>

      <a href={`/r/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="icon" title="View Public Page">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>

      <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isLoading} className="text-red-500 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
