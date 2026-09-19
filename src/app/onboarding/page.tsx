import Navbar from '@/components/navbar'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session: sessionId } = await searchParams

  if (!sessionId) {
    return <div>Invalid Session</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Navbar user={null} isAdmin={false} />
      
      <main className="flex-1 flex flex-col items-center pt-12 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-bold mb-4">
            Payment Successful 🎉
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            Welcome to Zyro
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Let's get your business profile and QR code ready. It only takes 30 seconds.
          </p>
        </div>

        <OnboardingClient sessionId={sessionId} />
      </main>
    </div>
  )
}
