import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Shield, KeyRound } from 'lucide-react'
import PasswordChangeForm from './password-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Account Settings <Shield className="w-8 h-8 text-indigo-500" />
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Manage your account security and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <Card className="xl:col-span-8 border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-xl">Change Password</CardTitle>
            </div>
            <CardDescription className="text-slate-500">Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
