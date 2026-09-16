const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 
    CREATE TABLE IF NOT EXISTS public.private_feedback (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    ALTER TABLE public.private_feedback ENABLE ROW LEVEL SECURITY;
    CREATE POLICY \"Public can insert feedback\" ON public.private_feedback FOR INSERT WITH CHECK (true);
    CREATE POLICY \"Owners can view feedback\" ON public.private_feedback FOR SELECT USING (true);
  });
  if (error) console.error(error);
  else console.log('Table created!');
}
run();
