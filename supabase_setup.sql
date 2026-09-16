CREATE TABLE IF NOT EXISTS public.private_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
    rating int NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.private_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" 
ON public.private_feedback FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.private_feedback FOR INSERT 
WITH CHECK (true);
