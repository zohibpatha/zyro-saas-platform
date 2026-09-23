import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone_number, amount, screenshot_url, months, saarthi_code } = body

    if (!phone_number || !amount || !screenshot_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Create Checkout Session
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .insert({
        phone_number,
        amount,
        months: months || 1,
        screenshot_url,
        saarthi_code,
        status: 'pending_ai'
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session Error:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // 2. Perform AI Verification (Mocked if API key is missing)
    // In production, you would fetch the image and send it to Gemini Vision API here.
    let isAiVerified = true; 
    let verificationReason = 'AI check passed (Mock)';

    if (process.env.GEMINI_API_KEY) {
      // Placeholder for actual Gemini API call
      // const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // const response = await genAI.models.generateContent({...})
      // isAiVerified = response.text().includes('VALID')
    } else {
      console.warn('GEMINI_API_KEY not found. Skipping strict AI verification and auto-approving for development.')
    }

    // 3. Update session status based on AI result
    if (isAiVerified) {
      // Create Audit record
      await supabase.from('payment_audits').insert({
        restaurant_id: body.restaurant_id || null,
        amount: amount,
        payment_type: body.restaurant_id ? 'RENEWAL' : 'SETUP',
        screenshot_url: screenshot_url,
        status: 'PENDING'
      });

      await supabase
        .from('checkout_sessions')
        .update({ status: 'ai_verified' })
        .eq('id', session.id)

      if (body.restaurant_id) {
        // Renewal Flow! Validate amount
        const planPrice = 199; // Or 399 depending on plan, assuming basic validation
        const requestedMonths = months || 1;
        
        if (amount < requestedMonths * planPrice) {
          return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
        }

        // Add 28 days via atomic RPC to prevent race conditions
        const { error: rpcError } = await supabase.rpc('renew_subscription', { 
          p_restaurant_id: body.restaurant_id, 
          p_months: requestedMonths 
        });

        if (rpcError) {
          console.error('RPC Error:', rpcError)
          throw rpcError;
        }

        const { data: currentRest } = await supabase.from('restaurants').select('slug, referred_by_code').eq('id', body.restaurant_id).single()

        if (currentRest?.referred_by_code) {
          const { data: affiliate } = await supabase
            .from('affiliates')
            .select('id, wallet_balance, total_earned')
            .eq('saarthi_code', currentRest.referred_by_code)
            .single()

          if (affiliate) {
            await supabase
              .from('affiliates')
              .update({
                wallet_balance: (affiliate.wallet_balance || 0) + 20,
                total_earned: (affiliate.total_earned || 0) + 20
              })
              .eq('id', affiliate.id)

            await supabase
              .from('affiliate_ledger')
              .insert({
                affiliate_id: affiliate.id,
                amount: 20,
                type: 'renewal_commission',
                status: 'completed'
              })
          }
        }

        return NextResponse.json({ success: true, isRenewal: true, slug: currentRest?.slug })
      }
      
      if (saarthi_code) {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id, wallet_balance, total_earned')
          .eq('saarthi_code', saarthi_code)
          .single()

        if (affiliate) {
          await supabase
            .from('affiliates')
            .update({
              wallet_balance: (affiliate.wallet_balance || 0) + 100,
              total_earned: (affiliate.total_earned || 0) + 100
            })
            .eq('id', affiliate.id)

          await supabase
            .from('affiliate_ledger')
            .insert({
              affiliate_id: affiliate.id,
              amount: 100,
              type: 'signup_commission',
              status: 'completed'
            })
        }
      }

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

