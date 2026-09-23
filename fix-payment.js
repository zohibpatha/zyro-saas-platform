const fs = require('fs');
let c = fs.readFileSync('src/app/api/verify-payment/route.ts', 'utf8');

// 1. Add validation before supabase client creation
const oldLine = '    const supabase = await createClient()';
const newLines = [
  '    // Validate months (must be 1-12)',
  '    const validatedMonths = Math.max(1, Math.min(12, parseInt(months) || 1))',
  '',
  '    // Server-side amount validation',
  '    const validAmounts = [199, 399, 499, 699, 999, 1499]',
  '    if (!validAmounts.includes(Number(amount))) {',
  "      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })",
  '    }',
  '',
  '    const supabase = await createClient()',
].join('\n');

c = c.replace(oldLine, newLines);

// 2. Use validatedMonths instead of raw months
c = c.replace('months: months || 1,', 'months: validatedMonths,');
c = c.replace('const requestedMonths = months || 1;', 'const requestedMonths = validatedMonths;');

fs.writeFileSync('src/app/api/verify-payment/route.ts', c, 'utf8');
console.log('Fixed verify-payment route');
