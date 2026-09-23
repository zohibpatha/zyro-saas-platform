import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAffiliateProfile, getAffiliateLedger } from '@/actions/affiliate'
import PartnerClient from './PartnerClient'

export const metadata = {
  title: 'Zyro Partner Dashboard',
  description: 'Manage your Zyro Saarthi affiliate account',
}

export default async function PartnerPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // If not logged in, redirect to login page with a specific callback
  if (!session) {
    redirect('/login?next=/partner')
  }

  // Fetch affiliate profile
  const { data: profile } = await getAffiliateProfile()
  
  // If profile exists, fetch ledger
  let ledger: any[] = []
  if (profile) {
    const { data: ledgerData } = await getAffiliateLedger()
    ledger = ledgerData || []
  }

  return (
    <PartnerClient 
      initialProfile={profile} 
      ledger={ledger} 
      userEmail={session.user.email || ''} 
    />
  )
}
