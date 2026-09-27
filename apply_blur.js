const fs = require('fs');
let code = fs.readFileSync('src/app/manage/[slug]/page.tsx', 'utf8');

// Add Lock icon import
if (!code.includes('Lock,')) {
  code = code.replace('ExternalLink, Link as LinkIcon, Camera, MapPin, QrCode, Sparkles, MessageSquareWarning, Users, MessageCircle', 'ExternalLink, Link as LinkIcon, Camera, MapPin, QrCode, Sparkles, MessageSquareWarning, Users, MessageCircle, Lock');
}

const blurOverlay = `
            {restaurant.plan_tier === 'Basic' && (
              <div className="absolute inset-0 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-b-3xl">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl text-center max-w-sm mx-4 border border-indigo-100 dark:border-indigo-900">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Pro Feature Locked</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Upgrade your plan to unlock this feature and grow your business faster.</p>
                  <Link href={\`/checkout?plan=399&restaurant_id=\${restaurant.id}\`} className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}
`;

// Replace Private Feedback CardContent
code = code.replace(/<CardContent className="relative z-10">\s*\{\!restaurant\.private_feedback/, '<CardContent className="relative z-10">' + blurOverlay + '\n            {!restaurant.private_feedback');

// Replace Customer CRM block wrapper
code = code.replace(/\{restaurant\.plan_tier \!\=\= 'Basic' \&\& \(\s*(<Card className="xl:col-span-12.*?<\/Card>)\s*\)\}/s, (match, p1) => {
  return p1.replace(/<CardContent className="relative z-10">\s*\{\!restaurant\.loyalty_customers/, '<CardContent className="relative z-10">' + blurOverlay + '\n            {!restaurant.loyalty_customers');
});

fs.writeFileSync('src/app/manage/[slug]/page.tsx', code);
