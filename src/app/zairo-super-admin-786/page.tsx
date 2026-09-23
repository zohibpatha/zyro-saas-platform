import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AdminActions from './admin-actions'
import { Plus } from 'lucide-react'
import { approvePaymentAudit, rejectPaymentAudit } from '@/actions/restaurant'
import { getAllPendingWithdrawals, markWithdrawalPaid } from '@/actions/affiliate'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return <div className="p-8 text-red-500">Access Denied</div>
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle()

  if (!adminUser) {
    return <div className="p-8 text-red-500 font-bold text-center mt-20 text-2xl">Unauthorized. This incident will be reported.</div>
  }

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error loading restaurants</div>
  }

  const { data: withdrawals } = await getAllPendingWithdrawals()
  
  const { data: audits } = await supabase
    .from('payment_audits')
    .select('*, restaurants(name)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all businesses across the platform</p>
        </div>
        <Link href="/zairo-super-admin-786/create">
          <Button className="bg-black text-white hover:bg-gray-800 shadow-sm h-9 px-4 rounded-md text-sm transition-all">
            <Plus className="w-4 h-4 mr-2" />
            New Business
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableHead className="h-10 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
              <TableHead className="h-10 text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</TableHead>
              <TableHead className="h-10 text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Email</TableHead>
              <TableHead className="h-10 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="h-10 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants?.map((restaurant) => (
              <TableRow key={restaurant.id} className="group border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-medium text-gray-900">{restaurant.name}</TableCell>
                <TableCell className="text-gray-500 text-sm font-mono">{restaurant.slug}</TableCell>
                <TableCell className="text-gray-600 text-sm">{restaurant.owner_email}</TableCell>
                <TableCell>
                  <Badge variant={restaurant.is_active ? 'default' : 'secondary'} className={`font-normal ${restaurant.is_active ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {restaurant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <AdminActions restaurant={restaurant} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {restaurants?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500 text-sm">
                  No businesses found. Create your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-8 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Pending Payment Audits (Access Granted by AI)</h2>
        {audits && audits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audits.map((a: any) => (
              <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                <img src={a.screenshot_url} alt="Payment Screenshot" className="w-full h-48 object-cover rounded-lg border border-gray-100" />
                <div className="font-medium text-gray-900 mt-2">{a.restaurants?.name || (a.phone_number ? `New Setup (${a.phone_number})` : 'New Setup')}</div>
                <div className="text-sm text-gray-500 font-mono">Type: {a.payment_type}</div>
                <div className="text-lg font-bold text-gray-900">₹{a.amount}</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <form action={async () => {
                    "use server";
                    await approvePaymentAudit(a.id);
                  }}>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await rejectPaymentAudit(a.id, a.restaurant_id);
                  }}>
                    <Button type="submit" variant="destructive" className="w-full">Reject (Revoke)</Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center border border-gray-100">
            No pending payments to audit.
          </div>
        )}
      </div>

      <div className="pt-8 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Affiliate Withdrawals</h2>
        {withdrawals && withdrawals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {withdrawals.map((w: any) => (
              <div key={w.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                <div className="font-medium text-gray-900">{w.affiliate?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500 font-mono">UPI: {w.affiliate?.upi_id || 'N/A'}</div>
                <div className="text-lg font-bold text-gray-900">₹{w.amount}</div>
                <form action={async () => {
                  "use server";
                  await markWithdrawalPaid(w.id);
                }} className="mt-2">
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Mark as Paid
                  </Button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center border border-gray-100">
            No pending withdrawals.
          </div>
        )}
      </div>
    </div>
  )
}

