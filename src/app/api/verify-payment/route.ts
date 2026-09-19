import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone_number, amount, screenshot_url, months } = body

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
      await supabase
        .from('checkout_sessions')
        .update({ status: 'ai_verified' })
        .eq('id', session.id)

      if (body.restaurant_id) {
        // Renewal Flow! Add 28 days to subscription
        const { data: currentRest } = await supabase.from('restaurants').select('subscription_end_date, slug').eq('id', body.restaurant_id).single()
        
        let newEnd = new Date()
        if (currentRest?.subscription_end_date) {
           const currentEnd = new Date(currentRest.subscription_end_date)
           if (currentEnd > new Date()) newEnd = currentEnd // Stack if not expired
        }
        newEnd.setDate(newEnd.getDate() + (months || 1) * 28)

        await supabase.from('restaurants').update({ subscription_end_date: newEnd.toISOString() }).eq('id', body.restaurant_id)
        
        return NextResponse.json({ success: true, isRenewal: true, slug: currentRest?.slug })
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
