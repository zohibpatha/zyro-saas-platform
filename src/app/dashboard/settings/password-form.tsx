'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/actions/auth'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function PasswordChangeForm() {
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsPending(false)
      return
    }

    const res = await updatePassword(newPassword)
    
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsPending(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-md">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 p-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4" />
          Password successfully updated!
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            required 
            minLength={6}
            placeholder="••••••••"
            className="bg-white/50 dark:bg-slate-950/50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            required 
            minLength={6}
            placeholder="••••••••"
            className="bg-white/50 dark:bg-slate-950/50"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Update Password'
        )}
      </Button>
    </form>
  )
}
