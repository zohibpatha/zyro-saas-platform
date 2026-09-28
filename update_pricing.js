const fs = require('fs');
let code = fs.readFileSync('src/app/pricing/page.tsx', 'utf8');

// Update tiers
code = code.replace(/setupFee: '₹499'/, "setupFee: 'FREE'");
// Starter tier has setupStrikethrough: null
code = code.replace(/setupStrikethrough: null/, "setupStrikethrough: '₹499'");

code = code.replace(/setupFee: '₹999'/, "setupFee: 'FREE'");
// Pro tier has setupStrikethrough: '₹1999'
code = code.replace(/setupStrikethrough: '₹1999'/, "setupStrikethrough: '₹999'");

code = code.replace(/setupFee: '₹1499'/, "setupFee: 'FREE'");
// Elite tier has setupStrikethrough: null
code = code.replace(/setupStrikethrough: null/, "setupStrikethrough: '₹1499'");

// Ensure we don't mess up characters
const oldRenderBlock = `              <div className="mb-6">
                <div className="flex items-baseline text-4xl font-extrabold text-slate-900 dark:text-white">
                  {tier.setupFee}
                  <span className="ml-2 text-lg font-medium text-slate-500 dark:text-slate-400 line-through">
                    {tier.setupStrikethrough || \`₹\${parseInt(tier.setupFee.replace('₹', '')) + parseInt(tier.priceMonthly.replace('₹', ''))}\`}
                  </span>
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2 bg-green-100 dark:bg-green-900/30 inline-block px-2 py-1 rounded">
                  🔥 Pay ONLY setup fee today!
                </div>
              </div>

              <div className={\`p-4 rounded-2xl mb-8 border \${tier.mostPopular ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}\`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Monthly Maintenance: {tier.priceMonthly}/mo</span>
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                  (1st Month is 100% FREE!)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Maintenance billing starts after 28 days.
                </div>
              </div>`;

const newRenderBlock = `              <div className="mb-6">
                <div className="flex items-baseline text-4xl font-extrabold text-green-600 dark:text-green-400">
                  {tier.setupFee}
                  <span className="ml-2 text-lg font-medium text-slate-500 dark:text-slate-400 line-through">
                    Setup: {tier.setupStrikethrough}
                  </span>
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2 bg-green-100 dark:bg-green-900/30 inline-block px-2 py-1 rounded">
                  🔥 100% OFF Setup Fee Today!
                </div>
              </div>

              <div className={\`p-4 rounded-2xl mb-8 border \${tier.mostPopular ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}\`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Pay only {tier.priceMonthly}/mo</span>
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                  (Billed monthly starting today)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  No hidden fees. Cancel anytime.
                </div>
              </div>`;

code = code.replace(oldRenderBlock, newRenderBlock);

// Replace FAQ
const faqToReplace = `{
    question: 'What is the setup fee for?',
    answer: 'The one-time setup fee covers the initial configuration, design, and personalized branding of your digital page by our team.'
  },
  `;
code = code.replace(faqToReplace, '');

fs.writeFileSync('src/app/pricing/page.tsx', code);
