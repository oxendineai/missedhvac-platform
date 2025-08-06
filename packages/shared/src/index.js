// 🔧 MissedHVAC Platform - Shared Business Logic
// The foundation for $1B SaaS empire

export const WIDGET_CONFIG = {
  DEFAULT_ENDPOINT: 'https://oxendineleads.app.n8n.cloud/webhook/38bab8c2-35b9-4f73-9d87-93f5eacd42e5',
  DEFAULT_THEME: 'orange',
  EMERGENCY_PHONE: '(555) 987-6643',
  COMPANY_NAME: 'MissedHVAC',
  // 🎯 HVAC-Specific Messaging (Pain Amplification)
  DEFAULT_GREETING: "🚨 HVAC Emergency? I'm here 24/7! What's wrong with your heating or cooling?",
  EMERGENCY_KEYWORDS: ['leak', 'no heat', 'broken AC', 'not cooling', 'emergency', 'urgent', 'broken'],
  PAIN_MESSAGES: {
    'no_heat': "No heat in winter can be dangerous! Let me help you get emergency service ASAP.",
    'broken_ac': "Broken AC during summer heat is miserable! I'll find you immediate cooling solutions.",
    'leak': "HVAC leaks can cause major damage! This needs urgent attention - let's get help now."
  }
};

// 💰 Business Model - Pricing Tiers (Connected to Stripe)
export const PRICING_TIERS = {
  STARTER: {
    name: 'Starter',
    price: 199,
    conversations: 5000,
    priceId: 'price_starter_199', // Update with real Stripe price IDs
    features: ['24/7 AI Support', 'Lead Capture', 'Basic Analytics', 'Never Miss Another Lead'],
    painMessage: 'Stop Losing $6,000/Month in After-Hours Leads'
  },
  PROFESSIONAL: {
    name: 'Professional', 
    price: 299,
    conversations: 15000,
    priceId: 'price_professional_299',
    features: ['Everything in Starter', 'CRM Integration', 'Custom Branding', 'Priority Support', 'Advanced Analytics'],
    painMessage: 'Most Popular - Dominate Your Local Market',
    badge: 'MOST POPULAR'
  },
  SCALE: {
    name: 'Scale',
    price: 399,
    conversations: -1, // unlimited
    priceId: 'price_scale_399',
    features: ['Everything in Professional', 'Unlimited Conversations', 'White Label', 'Custom Integrations', 'Dedicated Support'],
    painMessage: 'Unlimited Growth - Crush Your Competition'
  }
};

// 📊 Success Metrics (ROI Tracking)
export const SUCCESS_METRICS = {
  CONVERSION_GOALS: {
    'HVAC': { leadValue: 6000, conversionRate: 0.05, avgJobSize: 2500 },
    'PLUMBING': { leadValue: 4500, conversionRate: 0.06, avgJobSize: 1800 },
    'ROOFING': { leadValue: 8000, conversionRate: 0.04, avgJobSize: 12000 },
    'ELECTRICAL': { leadValue: 3500, conversionRate: 0.07, avgJobSize: 1200 }
  },
  ROI_MESSAGES: {
    'HVAC': 'Save $6,000/month in missed leads - ROI in first week!',
    'PLUMBING': 'Capture $4,500/month more revenue automatically',
    'ROOFING': 'Never miss an $8,000 roof replacement lead again'
  }
};

// 🗄️ Supabase Integration (Knowledge Base)
export const SUPABASE_CONFIG = {
  URL: process.env.SUPABASE_URL,
  ANON_KEY: process.env.SUPABASE_ANON_KEY
};

export async function queryKnowledgeBase(query, industry = 'HVAC', apiKey) {
  if (!validateApiKey(apiKey)) throw new Error('Invalid API Key');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
    
    // Vector similarity search for relevant knowledge
    const { data, error } = await supabase.rpc('match_documents', { 
      query_embedding: query,
      match_threshold: 0.8,
      match_count: 3,
      industry: industry
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Knowledge base query failed:', error);
    return []; // Graceful fallback
  }
}

// 💳 Stripe Integration (Self-Serve Payments)
export async function createSubscription(customerId, tier, industry = 'HVAC') {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const tierData = PRICING_TIERS[tier.toUpperCase()];
  
  if (!tierData) throw new Error('Invalid pricing tier');
  
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: tierData.priceId }],
    metadata: {
      industry: industry,
      tier: tier,
      leadValue: SUCCESS_METRICS.CONVERSION_GOALS[industry]?.leadValue || 5000
    }
  });
  
  return subscription;
}

// 🔑 API Key Management
export function generateCustomerApiKey(customerId, industry = 'HVAC') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${industry.toLowerCase()}_${customerId}_${timestamp}_${random}`;
}

export function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return false;
  // Format: industry_customerid_timestamp_random
  const parts = apiKey.split('_');
  return parts.length === 4 && ['hvac', 'plumbing', 'roofing', 'electrical'].includes(parts[0]);
}

// 📧 Lead Tracking (for Cold Email Campaigns)
export const LEAD_CONFIG = {
  INDUSTRIES: ['HVAC', 'PLUMBING', 'ROOFING', 'ELECTRICAL'],
  EMAIL_TEMPLATES: {
    'HVAC': {
      subject: "Stop Losing $6,000/Month in After-Hours HVAC Leads",
      preview: "AI chat widget captures leads 24/7 while you sleep"
    }
  },
  DOMAINS: {
    'HVAC': ['hvacai247.com', 'dontmissleadsc.com'],
    'PLUMBING': ['dontmissleadsm.com'],
    'ROOFING': ['dontmissleadsr.com']
  }
};

// 🎨 White Label Configuration
export function generateWhiteLabelConfig(customerId, industry, branding = {}) {
  const industryColors = {
    'HVAC': { primary: '#f97316', secondary: '#ea580c' },
    'PLUMBING': { primary: '#3b82f6', secondary: '#1d4ed8' },
    'ROOFING': { primary: '#dc2626', secondary: '#b91c1c' },
    'ELECTRICAL': { primary: '#eab308', secondary: '#ca8a04' }
  };
  
  return {
    customerId,
    industry,
    colors: branding.colors || industryColors[industry],
    companyName: branding.companyName || `${industry} Pro`,
    phone: branding.phone || WIDGET_CONFIG.EMERGENCY_PHONE,
    greeting: branding.greeting || WIDGET_CONFIG.DEFAULT_GREETING,
    ...branding
  };
}
