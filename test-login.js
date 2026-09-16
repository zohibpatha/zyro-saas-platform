const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://imibtipqsgdcdwsfqfao.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaWJ0aXBxc2dkY2R3c2ZxZmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzUwNjEsImV4cCI6MjEwNTExMTA2MX0.LP2mZ48uETGCWA-SC2M9-sIgHEJQYkO6jcTgtROBDsE');
supabase.auth.signInWithPassword({ email: 'zohibpathan784@gmail.com', password: 'Admin@12345' }).then(res => console.log(res));

