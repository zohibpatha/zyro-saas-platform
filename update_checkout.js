const fs = require('fs');
let code = fs.readFileSync('src/app/checkout/CheckoutClient.tsx', 'utf8');

const regexAmount = /let totalAmount = monthlyCost\s*let setupFee = 0\s*if \(\!isRenewal \|\| isTrialConversion\) \{[\s\S]*?totalAmount = setupFee\s*\}/;
code = code.replace(regexAmount, 'let totalAmount = monthlyCost;\n  let setupFee = 0;');

const oldText = /One-time Setup Fee \(28 Days Access Included\)/;
code = code.replace(oldText, 'First Month Maintenance');

const offerText = /<p className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900\/30 inline-block px-2 py-1 rounded">[\s\S]*? waived for the first month![\s\S]*?<\/p>/;
code = code.replace(offerText, '<p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-1 rounded">🔥 Limited Time Offer: Setup Fee Waived!</p>');

fs.writeFileSync('src/app/checkout/CheckoutClient.tsx', code);
