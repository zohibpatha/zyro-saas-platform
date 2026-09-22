import Navbar from '@/components/navbar'
import TrialClient from './TrialClient'

export const metadata = {
  title: 'Start 7-Day Free Trial - Zyro',
}

export default function TrialPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Navbar user={null} isAdmin={false} />
      
      <main className="flex-1 flex flex-col items-center pt-8 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-indigo-200">
            ✨ Premium 7-Day Free Trial
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            Build your Reputation Engine
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            No Credit Card Required. Full access to Pro features.
          </p>
        </div>

        <TrialClient />
      </main>
    </div>
  )
}
