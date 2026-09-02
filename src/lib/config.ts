export const config = {
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '2348022221111',
  phonePrimary: '+234 802 339 2388',
  phoneSecondary: '+234 810 383 2403',
  email: 'empathonautos@gmail.com',
  address: '123 Ajao Road, Ikeja, Lagos',
  businessHours: 'Mon–Fri 8am–6pm, Sat 9am–3pm',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://www.emphatonautos.com',
  siteName: 'Empathon Autos',
  siteDescription: 'Premium vehicle imports, pre-orders, and sales. Your trusted automotive partner in Lagos, Nigeria.',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
}
