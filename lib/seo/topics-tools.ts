// Software people search for by name: "alternative à <outil>" and
// "<outil A> vs <outil B>". Comparisons only pair tools of the same kind,
// so each page answers a choice someone actually hesitates over.

export const TOOL_GROUPS: Record<string, string[]> = {
  "assistants IA": ["ChatGPT", "Claude", "Gemini", "Le Chat de Mistral", "Perplexity", "Microsoft Copilot"],
  "codage avec l'IA": ["Cursor", "Claude Code", "Lovable", "Bolt", "Replit", "v0", "GitHub Copilot", "Windsurf"],
  "no-code": ["Bubble", "Webflow", "Glide", "Softr", "FlutterFlow", "Adalo", "Framer", "Wix"],
  "sites et blogs": ["WordPress", "Wix", "Squarespace", "Webflow", "Framer", "Ghost", "Hostinger Website Builder"],
  "e-commerce": ["Shopify", "WooCommerce", "PrestaShop", "Wix", "Squarespace", "BigCommerce"],
  paiement: ["Stripe", "PayPal", "Lemon Squeezy", "Paddle", "SumUp", "Mollie"],
  "gestion de projet": ["Notion", "Trello", "Asana", "ClickUp", "Monday", "Airtable", "Todoist", "Linear"],
  "prise de notes": ["Notion", "Obsidian", "Evernote", "Google Keep", "Apple Notes", "OneNote"],
  emailing: ["Brevo", "Mailchimp", "Substack", "Beehiiv", "Kit", "MailerLite", "Systeme.io"],
  automatisation: ["Zapier", "Make", "n8n", "IFTTT"],
  "backend et base de données": ["Supabase", "Firebase", "PocketBase", "Appwrite", "Xano"],
  hébergement: ["Vercel", "Netlify", "Render", "Railway", "Hostinger", "OVHcloud", "o2switch"],
  design: ["Canva", "Figma", "Adobe Express", "Photoshop", "Affinity"],
  "montage vidéo": ["CapCut", "Premiere Pro", "DaVinci Resolve", "InShot", "Final Cut Pro", "Descript"],
  "formations en ligne": ["Teachable", "Podia", "Thinkific", "Kajabi", "Systeme.io", "Schoolmaker"],
  CRM: ["HubSpot", "Pipedrive", "Salesforce", "Axonaut", "folk", "Zoho CRM"],
  "banque pro": ["Qonto", "Shine", "Revolut Business", "Blank", "Propulse by CA"],
  facturation: ["Indy", "Tiime", "Pennylane", "Abby", "Freebe", "Henrri"],
  "prise de rendez-vous": ["Calendly", "Cal.com", "Google Agenda", "Zcal", "Acuity Scheduling"],
  formulaires: ["Typeform", "Google Forms", "Tally", "Jotform", "Fillout"],
  "visio et messagerie": ["Slack", "Discord", "Microsoft Teams", "Zoom", "Google Meet"],
  "réseaux sociaux": ["Hootsuite", "Buffer", "Later", "Metricool", "Agorapulse"],
  SEO: ["Semrush", "Ahrefs", "Ubersuggest", "SE Ranking", "Moz"],
  "support client": ["Intercom", "Crisp", "Zendesk", "Freshdesk", "Tidio"],
  "images IA": ["Midjourney", "DALL-E", "Leonardo AI", "Ideogram", "Stable Diffusion", "Adobe Firefly"],
  "voix et audio IA": ["ElevenLabs", "Murf", "Descript", "Adobe Podcast"],
  "vente de produits numériques": ["Gumroad", "Lemon Squeezy", "Payhip", "Stan Store", "Systeme.io"],
  "liens en bio": ["Linktree", "Beacons", "Stan Store", "Taplink"],
  analytics: ["Google Analytics", "Plausible", "Matomo", "Fathom", "Hotjar"],
  "signature électronique": ["DocuSign", "Yousign", "Adobe Acrobat Sign", "PandaDoc"],
};

// Tools also searched with "alternative à", beyond the comparison groups.
const MORE_ALTERNATIVES = [
  "Doctolib", "Planity", "Treatwell", "Lydia", "Sumeria", "Malt", "Fiverr", "Upwork", "ComeUp", "Vinted", "Leboncoin",
  "Etsy", "Airbnb", "Booking", "TheFork", "Too Good To Go", "Duolingo", "Babbel", "Strava", "MyFitnessPal", "Yuka",
  "Patreon", "Tipeee", "Ulule", "KissKiss BankBank", "Leetchi", "Lydia Pro", "Loom", "Miro", "Jira", "Dropbox",
  "Google Drive", "WeTransfer", "Grammarly", "DeepL", "Google Traduction", "Otter.ai", "Notion AI", "Jasper",
  "Copy.ai", "Gamma", "Pitch", "PowerPoint", "Google Slides", "Excel", "Google Sheets", "Microsoft Word",
  "Google Docs", "Calendly", "Doodle", "Eventbrite", "Weezevent", "HelloAsso", "Mailjet", "Sendinblue",
  "WhatsApp Business", "Telegram", "Teachizy", "LearnyBox", "Podia", "Udemy", "Skool", "Circle", "Discord",
  "Wix Bookings", "Square", "Zettle", "Lightspeed", "Toast", "Uber Eats", "Deliveroo", "Glovo", "Indeed",
  "Welcome to the Jungle", "LinkedIn Premium", "Canva Pro", "ChatGPT Plus", "Adobe Premiere Rush", "VN",
  "Squarespace", "Carrd", "Linktree", "Substack", "Medium", "Patreon", "Ko-fi", "Buy Me a Coffee",
];

export function toolNames() {
  return [...new Set([...Object.values(TOOL_GROUPS).flat(), ...MORE_ALTERNATIVES])];
}

/** Every pair inside each group, once ("Notion vs Trello"). */
export function toolPairs() {
  const seen = new Set<string>();
  const pairs: string[] = [];
  for (const tools of Object.values(TOOL_GROUPS)) {
    for (let i = 0; i < tools.length; i++) {
      for (let j = i + 1; j < tools.length; j++) {
        const key = [tools[i], tools[j]].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push(`${tools[i]} vs ${tools[j]}`);
      }
    }
  }
  return pairs;
}
