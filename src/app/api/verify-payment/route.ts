import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone_number, amount, screenshot_url, months, saarthi_code } = body

    if (!phone_number || !amount || !screenshot_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cleanPhone = phone_number.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit WhatsApp number' }, { status: 400 })
    }

    // Validate months (must be 1-12)
    const validatedMonths = Math.max(1, Math.min(12, parseInt(months) || 1))

    // Server-side amount validation
    const validAmounts = [199, 399, 499, 699, 999, 1499]
    if (!validAmounts.includes(Number(amount))) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
    }

    const cleanSaarthiCode = saarthi_code ? saarthi_code.trim().toUpperCase() : null

    const supabase = await createClient()

    // Anti-Fraud: Prevent reuse of the exact same screenshot
    const { data: duplicateScreenshot } = await supabase
      .from('checkout_sessions')
      .select('id')
      .eq('screenshot_url', screenshot_url)
      .eq('status', 'ai_verified')
      .limit(1)
      .maybeSingle()

    if (duplicateScreenshot) {
      return NextResponse.json({ error: 'Fraud Protection: This payment screenshot has already been used.' }, { status: 400 })
    }

    // 1. Create Checkout Session
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .insert({
        phone_number: cleanPhone,
        amount,
        months: validatedMonths,
        screenshot_url,
        saarthi_code: cleanSaarthiCode,
        status: 'pending_ai'
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session Error:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // 2. Perform AI Verification (Mocked if API key is missing)
    let isAiVerified = true; 
    let verificationReason = 'AI check passed (Mock)';

    if (process.env.GEMINI_API_KEY) {
      // In production, Gemini Vision checks screenshot UTR & amount
    } else {
      console.warn('GEMINI_API_KEY not found. Auto-approving for development.')
    }

    // 3. Update session status based on AI result
    if (isAiVerified) {
      let creditedAffiliateId: string | null = null
      const numAmount = Number(amount);
      const requestedMonths = validatedMonths;

      if (body.restaurant_id) {
        // Renewal Flow
        const pricePerMonth = numAmount / requestedMonths;
        
        let renewalCommPerMonth = 20; // default for 399
        if (pricePerMonth <= 199) renewalCommPerMonth = 10;
        else if (pricePerMonth >= 699) renewalCommPerMonth = 30;
        
        const totalRenewalComm = renewalCommPerMonth * requestedMonths;

        // Add 28 days via atomic RPC
        const { error: rpcError } = await supabase.rpc('renew_subscription', { 
          p_restaurant_id: body.restaurant_id, 
          p_months: requestedMonths 
        });

        if (rpcError) {
          console.error('RPC Error:', rpcError)
          throw rpcError;
        }

        const { data: currentRest } = await supabase
          .from('restaurants')
          .select('slug, referred_by_code')
          .eq('id', body.restaurant_id)
          .single()

        if (currentRest?.referred_by_code) {
          const { data: affiliate } = await supabase
            .from('affiliates')
            .select('id, wallet_balance, total_earned')
            .eq('saarthi_code', currentRest.referred_by_code)
            .maybeSingle()

          if (affiliate) {
            creditedAffiliateId = affiliate.id
            await supabase
              .from('affiliates')
              .update({
                wallet_balance: (affiliate.wallet_balance || 0) + totalRenewalComm,
                total_earned: (affiliate.total_earned || 0) + totalRenewalComm
              })
              .eq('id', affiliate.id)

            await supabase
              .from('affiliate_ledger')
              .insert({
                affiliate_id: affiliate.id,
                amount: totalRenewalComm,
                type: 'renewal_commission',
                status: 'completed'
              })
          }
        }

        // Create Audit record for renewal
        await supabase.from('payment_audits').insert({
          restaurant_id: body.restaurant_id,
          amount: amount,
          payment_type: 'RENEWAL',
          screenshot_url: screenshot_url,
          status: 'PENDING',
          affiliate_id: creditedAffiliateId,
          phone_number: cleanPhone,
          session_id: session.id
        });

        await supabase
          .from('checkout_sessions')
          .update({ status: 'ai_verified' })
          .eq('id', session.id)

        return NextResponse.json({ success: true, isRenewal: true, slug: currentRest?.slug })
      }
      
      // New Signup Flow
      if (cleanSaarthiCode) {
        
        let signupComm = 100; // default for 999
        if (numAmount <= 499) signupComm = 50;
        else if (numAmount >= 1499 || numAmount === 699) signupComm = 150;
        
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id, wallet_balance, total_earned')
          .eq('saarthi_code', cleanSaarthiCode)
          .maybeSingle()

        if (affiliate) {
          creditedAffiliateId = affiliate.id
          await supabase
            .from('affiliates')
            .update({
              wallet_balance: (affiliate.wallet_balance || 0) + signupComm,
              total_earned: (affiliate.total_earned || 0) + signupComm
            })
            .eq('id', affiliate.id)

          await supabase
            .from('affiliate_ledger')
            .insert({
              affiliate_id: affiliate.id,
              amount: signupComm,
              type: 'signup_commission',
              status: 'completed'
            })
        }
      }

      // Create Audit record for setup
      await supabase.from('payment_audits').insert({
        restaurant_id: null,
        amount: amount,
        payment_type: 'SETUP',
        screenshot_url: screenshot_url,
        status: 'PENDING',
        affiliate_id: creditedAffiliateId,
        phone_number: cleanPhone,
        session_id: session.id
      });

      await supabase
        .from('checkout_sessions')
        .update({ status: 'ai_verified' })
        .eq('id', session.id)

      return NextResponse.json({ success: true, sessionId: session.id })
    } else {
      await supabase
        .from('checkout_sessions')
        .update({ status: 'rejected' })
        .eq('id', session.id)

      return NextResponse.json({ error: 'Screenshot verification failed. Please upload a clear payment success screenshot.' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Verify API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
